# AdoptMascota – Backend

Node.js + Express + Sequelize + MySQL 8. Arquitectura en capas: **MVC + servicios**.

## Puesta en marcha
```bash
npm install
cp .env.example .env        # completar DB_USER / DB_PASSWORD / JWT_SECRET
# crear la base en MySQL:  CREATE DATABASE adoptmascota CHARACTER SET utf8mb4;
npm run db:migrate          # crea las 7 tablas
npm run db:seed             # admin inicial + 4 mascotas de ejemplo
npm run dev                 # http://localhost:3000/api  (docs: /api/docs)
```
`npm run db:reset` borra y recrea todo.

## Estructura
```
src/
  config/        conexión Sequelize (config.js)
  constants/     ENUMs del DER (enums.js)
  models/        Usuario, PerfilUsuario, Animal, FotoAnimal, SolicitudAdopcion,
                 ObservacionSolicitud, HistorialCambio  (+ asociaciones)
  migrations/    una por tabla
  seeders/       admin + mascotas de ejemplo
  routes/        (vacío salvo /health – se llena en las próximas etapas)
  controllers/   reciben req/res
  services/      lógica de negocio
  middlewares/   errorHandler, upload (multer)
  utils/         AppError, respuestas JSON estándar
  docs/          openapi.yaml (Swagger en /api/docs)
uploads/         imágenes locales (se sirven en /uploads)
```

## Contrato de respuestas
- Éxito: `{ "success": true, "message": "...", "data": ... }`
- Error: `{ "success": false, "message": "...", "errors": [...] | null }`

## Notas
- `usuarios` y `animales` usan baja lógica (`deletedAt`, paranoid).
- `password_hash` no se devuelve por defecto; usar `Usuario.scope('withPassword')` en el login.
- Los valores de `tipo_color` se definieron como supuesto en `constants/enums.js`.

## Autenticación (etapa 2)
- Login: `POST /api/auth/login` → devuelve un token JWT (dura 8 h). Usarlo como `Authorization: Bearer <token>`.
- `JWT_SECRET` en el `.env` es obligatorio y tiene que ser propio (el servidor no arranca con el valor de ejemplo).
- Roles: `admin` gestiona usuarios; `administrativo` no. Rutas de usuarios: `/api/usuarios` (solo admin) y `/api/usuarios/me` (cualquier usuario logueado).
- Usuario inicial (seeder): `admin@adoptmascota.com` / `Admin1234!` (cambiar en producción).
