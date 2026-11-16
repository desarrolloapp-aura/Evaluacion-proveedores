# Configurar Google Sign-In (Etapa 4)

La encuesta solo deja entrar correos que el administrador registró en Evaluadores. El Client ID vive en `deploy/.env` en el servidor, no en el código.

## 1. Proyecto en Google Cloud

1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto (por ejemplo `evaluacion-proveedores-aura`) o usa uno existente.
3. Abre **APIs y servicios** → **Pantalla de consentimiento de OAuth**.
4. Elige tipo **Externo** (pueden registrarse correos fuera de Aura).
5. Completa nombre de la app, correo de soporte y correo del desarrollador.
6. En **Ámbitos**, deja los básicos de Google (`email`, `profile`, `openid`).
7. Si la app queda en modo de prueba, agrega como usuarios de prueba los correos que vas a usar.

## 2. Credencial OAuth

1. Ve a **APIs y servicios** → **Credenciales**.
2. **Crear credenciales** → **ID de cliente de OAuth**.
3. Tipo: **Aplicación web**.
4. Nombre: `proveedores.aura.cl`.
5. **Orígenes autorizados de JavaScript**:
   - `https://proveedores.aura.cl`
   - Para pruebas locales, si hace falta: `http://127.0.0.1:8891`
6. No hace falta URI de redirección para el botón de Google Identity Services.
7. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`).

## 3. Guardar el Client ID en veles

En el servidor (`cristopher@veles`), edita solo el archivo real:

```bash
nano ~/git/aura/evaluacion-proveedores/deploy/.env
```

Agrega o actualiza:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

No pegues el secreto de OAuth en el frontend. Para este flujo basta el Client ID.

Reinicia la API:

```bash
cd ~/git/aura/evaluacion-proveedores/deploy
docker compose up -d --build api
```

## 4. Probar

1. En el admin, abre **Evaluadores** y pon el correo de Google de un evaluador real.
2. En `https://proveedores.aura.cl`, acepta el consentimiento y ve a **Mis proveedores**.
3. Pulsa **Iniciar sesión con Google** con ese correo: debe verse el tablero.
4. Con un correo no registrado: debe salir el mensaje de no autorizado.
5. Evalúa un proveedor y confirma que vuelves al tablero con ese ítem en completados.

## Notas

- El Client ID es público por diseño de Google; igual no lo hardcodees en el repo.
- Si cambias el dominio, actualiza los orígenes autorizados en Cloud Console.
- Después de cambiar `.env`, siempre reconstruye o reinicia el contenedor `api`.
