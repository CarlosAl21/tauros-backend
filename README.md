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
JWT_SECRET=tu_jwt_secret
JWT_EXPIRATION=24h
PORT=3000
```

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
- `GET /auth/profile`: requiere JWT
- `GET /auth/validate`: requiere JWT

## Scripts utiles

```bash
npm run start
npm run start:dev
npm run build
npm run test
npm run test:e2e
```
