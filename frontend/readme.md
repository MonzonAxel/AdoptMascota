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

## Rutas 

- `/inicio`: landing publica
- `/mascotas`: galeria y filtro de mascotas
- `/mascotas/:id`: detalle de una mascota
- `/login`: acceso administrativo
- `/admin/mascotas`: gestion de mascotas
- `/admin/solicitudes`: solicitudes de adopcion
- `/admin/usuarios`: usuarios administrativos

Las rutas administrativas estan protegidas por `ProtectedRoute` y consultan la sesion autenticada del backend mediante una cookie `HttpOnly`.

## Componentes del admin

Los componentes exclusivos de administracion viven en `src/pages/admin/components`:

```text
components/
	AdminPagination.tsx
	forms/
		AnimalForm.tsx
		AnimalFormFields.tsx
		AnimalPhotosEditor.tsx
		UsuarioForm.tsx
```

`AnimalForm` coordina validacion, estado y guardado; `AnimalFormFields` presenta los datos de la mascota, y `AnimalPhotosEditor` concentra la seleccion y previsualizacion de fotos. Los cambios de portada y eliminacion siguen siendo pendientes hasta guardar el formulario. `AdminPagination` comparte la navegacion entre Mascotas y Solicitudes.

Se mantienen en `src/components` los elementos comunes como `Button`, `AdminDialog`, `PageHeader` y `StatusBadge`, para evitar duplicarlos entre pantallas.

## Estructura de `src`

```text
assets/       Imagenes y recursos estaticos
components/   Componentes reutilizables y sus estilos
context/      Estado global
hooks/        Hooks personalizados
layout/       Layout publico, privado y de acceso
pages/
	admin/      Mascotas, solicitudes, usuarios y componentes exclusivos del admin
	web/        Inicio y catalogo publico
	login/      Acceso administrativo independiente
routes/       Enrutado y proteccion de rutas
services/     Cliente Axios y endpoints
utils/        Datos de apoyo y funciones generales
types/        Tipos del dominio
global.css    Variables, tipografias y estilos base
```
