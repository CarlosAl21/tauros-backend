# Tauros Backend

Backend de TaurosGym construido con NestJS + TypeORM + PostgreSQL.

## Requisitos

- Node.js 20+
- PostgreSQL 15+

## Variables de entorno

Configura `.env` con estos valores base:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=TaurosGym
DB_SCHEMA=taurosBD
DB_EXTENSION_SCHEMA=taurosBD
DB_SSL=true
JWT_SECRET=tu_jwt_secret
PORT=3000

# Refresh tokens y cifrado
ENCRYPTION_KEY=64_hex_chars_aqui

# 2FA por correo
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_password_o_app_password
SMTP_FROM=TaurosGym <tu_correo@gmail.com>
```

En Render, `DB_SSL` puede omitirse porque la app lo activa automaticamente al detectar el entorno.

## Instalacion y ejecucion

```bash
npm install
npm run start:dev
```

## Documentacion de endpoints (Swagger)

Swagger queda habilitado automaticamente en:

- Local: `http://localhost:3000/docs`
- Render: `https://<tu-servicio>.onrender.com/docs`

## Como iniciar sesion y probar endpoints con guards

1. En Swagger abre `POST /auth/login`.
2. Envia `correo` y `password` de un usuario registrado.
3. Copia el `access_token` de la respuesta.
4. Pulsa **Authorize** (arriba a la derecha).
5. Pega: `Bearer <access_token>`.
6. Ejecuta cualquier endpoint protegido con `RolesGuard`.

Swagger conserva el token durante la sesion para que no tengas que pegarlo en cada request.

## Politica de acceso por roles

Se aplico `@UseGuards(RolesGuard)` + `@Roles(...)` en todos los controladores de negocio.

- Lectura (`GET`): `ADMIN`, `COACH`, `USER`
- Escritura (`POST`, `PATCH`, `DELETE`): `ADMIN`, `COACH`
- Excepcion en usuarios: `DELETE /usuario/:id` solo `ADMIN`

## Endpoints de autenticacion

- `POST /auth/register`: registro de usuario
- `POST /auth/login`: obtiene JWT
- `POST /auth/refresh`: intercambia refresh token por access token nuevo
- `POST /auth/logout`: revoca refresh token
- `GET /auth/profile`: requiere JWT
- `GET /auth/validate`: requiere JWT
- `POST /auth/2fa/enable`: solicita codigo para activar 2FA
- `POST /auth/2fa/send`: reenvia codigo 2FA
- `POST /auth/2fa/verify`: verifica codigo 2FA para login o activacion

## Seguridad y almacenamiento

- El `access_token` y el `refresh_token` se guardan en Secure Store en el movil.
- El access token dura poco; el refresh token rota y se revoca en la base de datos.
- Los datos sensibles pueden migrarse a columnas cifradas con AES-256-GCM usando `src/scripts/migrate-encrypt.ts`.

## Despliegue y migracion

1. Define `ENCRYPTION_KEY` y las credenciales SMTP antes de activar cifrado o 2FA.
2. Ejecuta primero en staging el script de migracion de cifrado.
3. Verifica el envio de correo con una cuenta de prueba.
4. Si usas Render, asegúrate de que la base de datos y el servidor compartan el mismo `JWT_SECRET` y `ENCRYPTION_KEY`.

## Scripts utiles

```bash
npm run start
npm run start:dev
npm run build
npm run test
npm run test:e2e
```
