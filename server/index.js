const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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

async function ensureAdminPassword() {
  const { rows } = await pool.query('SELECT id FROM admin_password LIMIT 1');
  if (rows.length || !process.env.ADMIN_PASSWORD) return;
  await pool.query('INSERT INTO admin_password (password_hash) VALUES ($1)', [
    hashPassword(process.env.ADMIN_PASSWORD)
  ]);
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
            fecha_inicio_encuesta, fecha_fin_encuesta, zona_horaria_encuesta
     FROM config_evaluacion ORDER BY created_at DESC LIMIT 1`
  );
  res.json(rows[0] || null);
});

app.put('/api/config', requireAdmin, async (req, res) => {
  const c = req.body || {};
  const { rows } = await pool.query('SELECT id FROM config_evaluacion ORDER BY created_at DESC LIMIT 1');
  const values = [
    c.titulo, c.descripcion, c.objetivo,
    JSON.stringify(c.items_producto || []),
    JSON.stringify(c.items_servicio || []),
    c.anio_encuesta || null,
    c.fecha_inicio_encuesta || null,
    c.fecha_fin_encuesta || null,
    c.zona_horaria_encuesta || 'America/Santiago'
  ];
  if (rows.length) {
    await pool.query(
      `UPDATE config_evaluacion SET titulo=$1, descripcion=$2, objetivo=$3,
        items_producto=$4::jsonb, items_servicio=$5::jsonb, anio_encuesta=$6,
        fecha_inicio_encuesta=$7, fecha_fin_encuesta=$8, zona_horaria_encuesta=$9
       WHERE id=$10`,
      [...values, rows[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO config_evaluacion
        (titulo, descripcion, objetivo, items_producto, items_servicio, anio_encuesta,
         fecha_inicio_encuesta, fecha_fin_encuesta, zona_horaria_encuesta)
       VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9)`,
      values
    );
  }
  res.json({ ok: true });
});

app.get('/api/evaluadores', async (req, res) => {
  if (req.query.admin === '1' && !(await passwordMatches(req.get('x-admin-password')))) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  const { rows } = await pool.query(
    'SELECT nombre FROM evaluadores WHERE activo = true ORDER BY nombre'
  );
  res.json(rows);
});

app.post('/api/evaluadores', requireAdmin, async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  if (!nombre) {
    res.status(400).json({ error: 'Falta el nombre' });
    return;
  }
  await pool.query(
    `INSERT INTO evaluadores (nombre, activo) VALUES ($1, true)
     ON CONFLICT (nombre) DO UPDATE SET activo = true`,
    [nombre]
  );
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
  const { rows } = await pool.query(
    `SELECT e.id AS evaluador_id, p.id AS proveedor_id
     FROM evaluadores e
     JOIN asignaciones a ON a.evaluador_id = e.id AND a.tipo = $3
     JOIN proveedores p ON p.id = a.proveedor_id AND p.nombre = $2 AND p.tipo = $3 AND p.activo = true
     WHERE e.nombre = $1 AND e.activo = true
     LIMIT 1`,
    [String(b.evaluador || '').trim(), String(b.proveedor || '').trim(), b.tipo]
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
  res.status(500).json({ error: 'Error interno' });
});

ensureAdminPassword()
  .then(() => {
    app.listen(3000, '0.0.0.0', () => console.log('API de proveedores escuchando en 3000'));
  })
  .catch((error) => {
    console.error('No se pudo iniciar la API', error);
    process.exit(1);
  });
