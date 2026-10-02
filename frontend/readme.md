# AdoptMascota - Frontend

Frontend de AdoptMascota construido con React, TypeScript y Vite.

## Desarrollo

```bash
npm install
npm run dev
```

Otros comandos disponibles:

```bash
npm run build
npm run lint
npm run preview
```

Copiar `.env.example` como `.env.local` para configurar la URL base de la API.

## Tecnologias

- React + TypeScript + Vite
- Axios para clientes HTTP
- React Hook Form + Zod para formularios y validacion
- TanStack Query para estado servidor
- React Router DOM para navegacion
- Lucide React para iconos
- CSS propio para estilos globales y componentes reutilizables

## Rutas iniciales

- `/inicio`: landing publica
- `/mascotas`: galeria y filtro de mascotas
- `/mascotas/:id`: detalle de una mascota
- `/login`: acceso administrativo
- `/admin/mascotas`: gestion de mascotas
- `/admin/solicitudes`: solicitudes de adopcion
- `/admin/usuarios`: usuarios administrativos

Las rutas administrativas estan protegidas por `ProtectedRoute`. La autenticacion actual es local y temporal, lista para conectarse al backend.

## Estructura de `src`

```text
assets/       Imagenes y recursos estaticos
components/   Componentes reutilizables y sus estilos
context/      Estado global
hooks/        Hooks personalizados
layout/       Layout publico y privado
pages/        Vistas organizadas por pagina
routes/       Enrutado y proteccion de rutas
services/     Cliente Axios y endpoints
utils/        Datos de apoyo y funciones generales
types/        Tipos del dominio
global.css    Variables, tipografias y estilos base
```
