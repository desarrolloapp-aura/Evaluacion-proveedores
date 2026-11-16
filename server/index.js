const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const googleClientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const app = express();
app.use(express.json({ limit: '1mb' }));

for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
  const original = app[method].bind(app);
  app[method] = (path, ...handlers) => original(path, ...handlers.map((handler) => (
    handler.length >= 4
      ? handler
      : (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
  )));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password), 'utf8').digest('hex');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function getBearerToken(req) {
  const header = String(req.get('authorization') || '');
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return String(req.get('x-google-token') || req.body?.credential || '').trim();
}

async function passwordMatches(password) {
  if (!password) return false;
  const { rows } = await pool.query(
    'SELECT password_hash FROM admin_password ORDER BY updated_at DESC LIMIT 1'
  );
  if (!rows.length) return false;
  const received = hashPassword(password);
  const stored = Buffer.from(rows[0].password_hash);
  const incoming = Buffer.from(received);
  if (stored.length !== incoming.length) return false;
  return crypto.timingSafeEqual(stored, incoming);
}

async function requireAdmin(req, res, next) {
  try {
    const ok = await passwordMatches(req.get('x-admin-password'));
    if (!ok) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'No se pudo validar el acceso' });
  }
}

async function ensureSchema() {
  await pool.query('ALTER TABLE evaluadores ADD COLUMN IF NOT EXISTS email TEXT');
  await pool.query(
    'ALTER TABLE config_evaluacion ADD COLUMN IF NOT EXISTS minutos_sesion INTEGER DEFAULT 10'
  );
}

async function ensureAdminPassword() {
  const { rows } = await pool.query('SELECT id FROM admin_password LIMIT 1');
  if (rows.length || !process.env.ADMIN_PASSWORD) return;
  await pool.query('INSERT INTO admin_password (password_hash) VALUES ($1)', [
    hashPassword(process.env.ADMIN_PASSWORD)
  ]);
}

async function verifyGoogleIdToken(idToken) {
  if (!googleClient || !googleClientId) {
    const error = new Error('Google Sign-In no está configurado');
    error.status = 503;
    throw error;
  }
  if (!idToken) {
    const error = new Error('Falta el token de Google');
    error.status = 401;
    throw error;
  }
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: googleClientId
  });
  const payload = ticket.getPayload() || {};
  const email = normalizeEmail(payload.email);
  if (!email || payload.email_verified === false) {
    const error = new Error('El correo de Google no está verificado');
    error.status = 401;
    throw error;
  }
  return { email, name: payload.name || '', picture: payload.picture || '' };
}

async function findEvaluadorByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, nombre, email
     FROM evaluadores
     WHERE activo = true AND lower(trim(email)) = $1
     LIMIT 1`,
    [normalizeEmail(email)]
  );
  return rows[0] || null;
}

async function requireEvaluador(req, res, next) {
  try {
    const google = await verifyGoogleIdToken(getBearerToken(req));
    const evaluador = await findEvaluadorByEmail(google.email);
    if (!evaluador) {
      res.status(403).json({ error: 'No se pudo iniciar sesión' });
      return;
    }
    req.evaluador = evaluador;
    req.googleUser = google;
    next();
  } catch (error) {
    res.status(error.status || 401).json({ error: error.message || 'No autorizado' });
  }
}

async function emailTakenByOther(email, nombreActual) {
  if (!email) return false;
  const { rows } = await pool.query(
    `SELECT 1 FROM evaluadores
     WHERE activo = true
       AND lower(trim(email)) = $1
       AND ($2::text IS NULL OR nombre <> $2)
     LIMIT 1`,
    [normalizeEmail(email), nombreActual || null]
  );
  return rows.length > 0;
}

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.post('/api/admin/verificar', async (req, res) => {
  res.json({ ok: await passwordMatches(req.body.password) });
});

app.post('/api/admin/password', async (req, res) => {
  const { passwordActual, nuevaPassword } = req.body || {};
  if (!nuevaPassword || String(nuevaPassword).length < 6) {
    res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    return;
  }
  if (!(await passwordMatches(passwordActual))) {
    res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    return;
  }
  await pool.query(
    'UPDATE admin_password SET password_hash = $1, updated_at = now() WHERE id = (SELECT id FROM admin_password ORDER BY updated_at DESC LIMIT 1)',
    [hashPassword(nuevaPassword)]
  );
  res.json({ ok: true });
});

app.get('/api/config', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT titulo, descripcion, objetivo, items_producto, items_servicio, anio_encuesta,
            fecha_inicio_encuesta, fecha_fin_encuesta, zona_horaria_encuesta, minutos_sesion
     FROM config_evaluacion ORDER BY created_at DESC LIMIT 1`
  );
  res.json(rows[0] || null);
});

app.put('/api/config', requireAdmin, async (req, res) => {
  const c = req.body || {};
  const { rows } = await pool.query('SELECT id FROM config_evaluacion ORDER BY created_at DESC LIMIT 1');
  let minutosSesion = Number(c.minutos_sesion);
  if (!Number.isFinite(minutosSesion) || minutosSesion < 1) minutosSesion = 10;
  if (minutosSesion > 240) minutosSesion = 240;
  const values = [
    c.titulo, c.descripcion, c.objetivo,
    JSON.stringify(c.items_producto || []),
    JSON.stringify(c.items_servicio || []),
    c.anio_encuesta || null,
    c.fecha_inicio_encuesta || null,
    c.fecha_fin_encuesta || null,
    c.zona_horaria_encuesta || 'America/Santiago',
    minutosSesion
  ];
  if (rows.length) {
    await pool.query(
      `UPDATE config_evaluacion SET titulo=$1, descripcion=$2, objetivo=$3,
        items_producto=$4::jsonb, items_servicio=$5::jsonb, anio_encuesta=$6,
        fecha_inicio_encuesta=$7, fecha_fin_encuesta=$8, zona_horaria_encuesta=$9,
        minutos_sesion=$10
       WHERE id=$11`,
      [...values, rows[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO config_evaluacion
        (titulo, descripcion, objetivo, items_producto, items_servicio, anio_encuesta,
         fecha_inicio_encuesta, fecha_fin_encuesta, zona_horaria_encuesta, minutos_sesion)
       VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9,$10)`,
      values
    );
  }
  res.json({ ok: true });
});

app.get('/api/auth/google-client-id', (_req, res) => {
  res.json({ clientId: googleClientId || null, configured: Boolean(googleClientId) });
});

app.post('/api/auth/google', async (req, res) => {
  const google = await verifyGoogleIdToken(getBearerToken(req) || req.body?.credential);
  const evaluador = await findEvaluadorByEmail(google.email);
  if (!evaluador) {
    res.status(403).json({ error: 'No se pudo iniciar sesión' });
    return;
  }
  res.json({
    ok: true,
    nombre: evaluador.nombre,
    email: normalizeEmail(evaluador.email || google.email)
  });
});

app.get('/api/evaluador/pendientes', requireEvaluador, async (req, res) => {
  const anio = Number(req.query.anio) || new Date().getFullYear();
  const { rows } = await pool.query(
    `SELECT p.nombre AS proveedor, a.tipo,
            EXISTS (
              SELECT 1 FROM evaluaciones ev
              WHERE ev.evaluador_id = e.id
                AND ev.proveedor_id = p.id
                AND ev.tipo_proveedor = a.tipo
                AND ev."año" = $2
            ) AS evaluado
     FROM asignaciones a
     JOIN evaluadores e ON e.id = a.evaluador_id
     JOIN proveedores p ON p.id = a.proveedor_id AND p.activo = true
     WHERE e.id = $1
     ORDER BY a.tipo, p.nombre`,
    [req.evaluador.id, anio]
  );
  const pendientes = rows.filter((row) => !row.evaluado);
  const completados = rows.filter((row) => row.evaluado);
  res.json({
    evaluador: { nombre: req.evaluador.nombre, email: normalizeEmail(req.evaluador.email) },
    anio,
    pendientes,
    completados,
    total: rows.length
  });
});

app.get('/api/evaluadores', async (req, res) => {
  const isAdmin = req.query.admin === '1';
  if (isAdmin && !(await passwordMatches(req.get('x-admin-password')))) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  const columns = isAdmin ? 'nombre, email, activo' : 'nombre';
  const { rows } = await pool.query(
    `SELECT ${columns} FROM evaluadores WHERE activo = true ORDER BY nombre`
  );
  res.json(rows);
});

app.post('/api/evaluadores', requireAdmin, async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const email = normalizeEmail(req.body.email);
  if (!nombre) {
    res.status(400).json({ error: 'Falta el nombre' });
    return;
  }
  if (email && !isValidEmail(email)) {
    res.status(400).json({ error: 'El correo no es válido' });
    return;
  }
  if (email && (await emailTakenByOther(email, null))) {
    res.status(409).json({ error: 'Ese correo ya está asignado a otro evaluador' });
    return;
  }
  await pool.query(
    `INSERT INTO evaluadores (nombre, email, activo) VALUES ($1, $2, true)
     ON CONFLICT (nombre) DO UPDATE SET activo = true, email = COALESCE(EXCLUDED.email, evaluadores.email)`,
    [nombre, email || null]
  );
  res.json({ ok: true });
});

app.patch('/api/evaluadores/email', requireAdmin, async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const email = normalizeEmail(req.body.email);
  if (!nombre) {
    res.status(400).json({ error: 'Falta el nombre' });
    return;
  }
  if (email && !isValidEmail(email)) {
    res.status(400).json({ error: 'El correo no es válido' });
    return;
  }
  if (email && (await emailTakenByOther(email, nombre))) {
    res.status(409).json({ error: 'Ese correo ya está asignado a otro evaluador' });
    return;
  }
  await pool.query('UPDATE evaluadores SET email = $2 WHERE nombre = $1', [
    nombre,
    email || null
  ]);
  res.json({ ok: true });
});

app.delete('/api/evaluadores', requireAdmin, async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  await pool.query(
    `DELETE FROM asignaciones WHERE evaluador_id IN (SELECT id FROM evaluadores WHERE nombre = $1)`,
    [nombre]
  );
  await pool.query('UPDATE evaluadores SET activo = false WHERE nombre = $1', [nombre]);
  res.json({ ok: true });
});

app.get('/api/proveedores', async (req, res) => {
  const isAdmin = req.query.admin === '1';
  if (isAdmin && !(await passwordMatches(req.get('x-admin-password')))) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  const columns = isAdmin ? 'nombre, tipo, email, activo' : 'nombre, tipo, activo';
  const { rows } = await pool.query(
    `SELECT ${columns} FROM proveedores WHERE activo = true ORDER BY nombre`
  );
  res.json(rows);
});

app.post('/api/proveedores', requireAdmin, async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const tipo = req.body.tipo;
  const email = req.body.email || '';
  if (!nombre || (tipo !== 'PRODUCTO' && tipo !== 'SERVICIO')) {
    res.status(400).json({ error: 'Nombre o tipo inválido' });
    return;
  }
  await pool.query(
    `INSERT INTO proveedores (nombre, tipo, email, activo) VALUES ($1, $2, $3, true)
     ON CONFLICT (nombre) DO UPDATE SET tipo = EXCLUDED.tipo, email = EXCLUDED.email, activo = true`,
    [nombre, tipo, email]
  );
  res.json({ ok: true });
});

app.patch('/api/proveedores/email', requireAdmin, async (req, res) => {
  await pool.query('UPDATE proveedores SET email = $2 WHERE nombre = $1', [
    String(req.body.nombre || '').trim(),
    req.body.email || ''
  ]);
  res.json({ ok: true });
});

app.delete('/api/proveedores', requireAdmin, async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  await pool.query(
    `DELETE FROM asignaciones WHERE proveedor_id IN (SELECT id FROM proveedores WHERE nombre = $1)`,
    [nombre]
  );
  await pool.query('UPDATE proveedores SET activo = false WHERE nombre = $1', [nombre]);
  res.json({ ok: true });
});

app.get('/api/asignaciones', requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT e.nombre AS evaluador_nombre, p.nombre AS proveedor_nombre, a.tipo
     FROM asignaciones a
     JOIN evaluadores e ON e.id = a.evaluador_id AND e.activo = true
     JOIN proveedores p ON p.id = a.proveedor_id AND p.activo = true
     ORDER BY e.nombre, a.tipo, p.nombre`
  );
  res.json(rows);
});

app.get('/api/asignaciones/publico', async (req, res) => {
  const nombre = String(req.query.evaluador || '').trim();
  const { rows } = await pool.query(
    `SELECT p.nombre AS proveedor_nombre, a.tipo
     FROM asignaciones a
     JOIN evaluadores e ON e.id = a.evaluador_id AND e.activo = true
     JOIN proveedores p ON p.id = a.proveedor_id AND p.activo = true
     WHERE e.nombre = $1
     ORDER BY a.tipo, p.nombre`,
    [nombre]
  );
  res.json(rows);
});

app.put('/api/asignaciones', requireAdmin, async (req, res) => {
  const list = Array.isArray(req.body.asignaciones) ? req.body.asignaciones : [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM asignaciones');
    for (const item of list) {
      const evaluador = String(item.evaluador_nombre || '').trim();
      const proveedor = String(item.proveedor_nombre || '').trim();
      const tipo = item.tipo;
      if (!evaluador || !proveedor || (tipo !== 'PRODUCTO' && tipo !== 'SERVICIO')) continue;
      await client.query(
        `INSERT INTO asignaciones (evaluador_id, proveedor_id, tipo)
         SELECT e.id, p.id, $3
         FROM evaluadores e
         JOIN proveedores p ON p.nombre = $2 AND p.tipo = $3 AND p.activo = true
         WHERE e.nombre = $1 AND e.activo = true
         ON CONFLICT (evaluador_id, proveedor_id, tipo) DO NOTHING`,
        [evaluador, proveedor, tipo]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

app.get('/api/evaluaciones', requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT e.id, ev.nombre AS evaluador_nombre, p.nombre AS proveedor_nombre,
            e.tipo_proveedor, e.correo_proveedor, e.respuestas, e.resultado_final,
            e.fecha_evaluacion, e.created_at, e."año"
     FROM evaluaciones e
     LEFT JOIN evaluadores ev ON ev.id = e.evaluador_id
     LEFT JOIN proveedores p ON p.id = e.proveedor_id
     ORDER BY e.created_at DESC`
  );
  res.json(rows);
});

app.post('/api/evaluaciones', async (req, res) => {
  const b = req.body || {};
  const token = getBearerToken(req);
  let evaluadorNombre = String(b.evaluador || '').trim();

  if (token) {
    const google = await verifyGoogleIdToken(token);
    const evaluador = await findEvaluadorByEmail(google.email);
    if (!evaluador) {
      res.status(403).json({ error: 'No se pudo iniciar sesión' });
      return;
    }
    if (evaluadorNombre && evaluadorNombre !== evaluador.nombre) {
      res.status(403).json({ error: 'No se pudo completar la operación' });
      return;
    }
    evaluadorNombre = evaluador.nombre;
  } else if (googleClientId) {
    res.status(401).json({ error: 'Debe iniciar sesión con Google para guardar la evaluación' });
    return;
  }

  const { rows } = await pool.query(
    `SELECT e.id AS evaluador_id, p.id AS proveedor_id
     FROM evaluadores e
     JOIN asignaciones a ON a.evaluador_id = e.id AND a.tipo = $3
     JOIN proveedores p ON p.id = a.proveedor_id AND p.nombre = $2 AND p.tipo = $3 AND p.activo = true
     WHERE e.nombre = $1 AND e.activo = true
     LIMIT 1`,
    [evaluadorNombre, String(b.proveedor || '').trim(), b.tipo]
  );
  if (!rows.length) {
    res.status(400).json({ error: 'Ese proveedor no está asignado a este evaluador' });
    return;
  }
  await pool.query(
    `INSERT INTO evaluaciones
      (evaluador_id, proveedor_id, tipo_proveedor, correo_proveedor, respuestas, resultado_final, fecha_evaluacion, "año")
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8)`,
    [
      rows[0].evaluador_id,
      rows[0].proveedor_id,
      b.tipo,
      b.correoProveedor || '',
      JSON.stringify(b.respuestas || []),
      b.resultadoFinal,
      b.fechaEvaluacion || new Date().toISOString(),
      b.anio || new Date().getFullYear()
    ]
  );
  res.json({ ok: true });
});

app.delete('/api/evaluaciones/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM evaluaciones WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/evaluaciones-admin', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT item, valor FROM evaluaciones_admin WHERE proveedor = $1',
    [req.query.proveedor || '']
  );
  res.json(rows);
});

app.put('/api/evaluaciones-admin', requireAdmin, async (req, res) => {
  await pool.query(
    `INSERT INTO evaluaciones_admin (proveedor, item, valor, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (proveedor, item) DO UPDATE SET valor = EXCLUDED.valor, updated_at = now()`,
    [req.body.proveedor, req.body.item, req.body.valor]
  );
  res.json({ ok: true });
});

app.delete('/api/evaluaciones-admin', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM evaluaciones_admin WHERE proveedor = $1 AND item = $2', [
    req.body.proveedor,
    req.body.item
  ]);
  res.json({ ok: true });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = Number(error.status) || 500;
  res.status(status).json({
    error: status >= 500 ? 'Error interno' : (error.message || 'Error interno')
  });
});

ensureSchema()
  .then(ensureAdminPassword)
  .then(() => {
    app.listen(3000, '0.0.0.0', () => console.log('API de proveedores escuchando en 3000'));
  })
  .catch((error) => {
    console.error('No se pudo iniciar la API', error);
    process.exit(1);
  });
