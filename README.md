# Sistema de Gestión de Tutorías — DDS 2026

## Descripción

Aplicación web full stack para gestión de tutorías. Permite a estudiantes solicitar turnos, tutores administrar su agenda y administradores supervisar disponibilidad, estados y conflictos.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express |
| ORM | Sequelize |
| Base de datos | SQLite |
| Frontend | React + Vite |
| Routing frontend | react-router-dom |
| HTTP client | Axios |
| Formularios | React Hook Form |
| Autenticación | JWT (access + refresh token) |
| Hashing | bcryptjs |
| Testing | Jest 29 + Supertest |

---

## Cómo ejecutar

### Backend

```bash
cd backend
npm install
npm run seed     # carga datos iniciales (obligatorio la primera vez)
npm run dev      # inicia el servidor en http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # inicia en http://localhost:5173
```

---

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@tutorias.com | Admin1234 |
| Tutor | marina@tutorias.com | Tutor1234 |
| Tutor | carlos@tutorias.com | Tutor1234 |
| Estudiante | juan@tutorias.com | Estudiante1234 |
| Estudiante | vale@tutorias.com | Estudiante1234 |

---

## Endpoints principales

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | /api/auth/register | Registrar usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |
| POST | /api/auth/logout | Cerrar sesión | Sí |
| GET | /api/tutores | Listar tutores activos | Sí |
| GET | /api/turnos | Listar turnos con filtros | Sí |
| GET | /api/turnos/resumen | Resumen administrativo | Admin |
| GET | /api/turnos/:id | Detalle de un turno | Sí |
| GET | /api/turnos/:id/historial | Historial de un turno | Sí |
| POST | /api/turnos | Crear turno | Estudiante/Admin |
| PUT | /api/turnos/:id | Editar turno | Según rol |
| PATCH | /api/turnos/:id/cancelar | Cancelar turno | Según rol |
| PATCH | /api/turnos/:id/confirmar | Confirmar turno | Tutor/Admin |
| PATCH | /api/turnos/:id/realizar | Marcar como realizado | Tutor/Admin |

---

## Rutas del frontend

| Ruta | Descripción | Roles |
|---|---|---|
| /login | Iniciar sesión | Público |
| /register | Registrarse | Público |
| /turnos | Listado con filtros y paginación | Todos |
| /turnos/:id | Detalle e historial del turno | Todos |
| /turnos/nuevo | Solicitar nuevo turno | Estudiante/Admin |
| /turnos/:id/editar | Editar turno existente | Según rol |
| /admin/resumen | Panel administrativo | Admin |
| * | Página 404 | Todos |

---

## Disponibilidad y superposición

Un turno solo puede crearse o editarse si se cumplen tres condiciones:

1. **El tutor existe y está activo** — si no, devuelve 400 con mensaje específico.
2. **El día de la semana de la fecha solicitada está en `diasDisponibles` del tutor** — si no, devuelve 400 indicando el día.
3. **No hay superposición horaria** — se buscan turnos del mismo tutor y fecha en estado `solicitado` o `confirmado`. Dos turnos se superponen si `horaInicio1 < horaFin2 && horaFin1 > horaInicio2`. Si uno termina a las 11:00 y otro empieza a las 11:00, no hay superposición. Al editar se ignora el propio turno en la comparación.

Esta validación vive exclusivamente en `services/turnos.service.js`, tanto para creación como para edición y reasignación de tutor.

---

## JWT, roles y permisos

- Al hacer login se generan dos tokens: **access token** (15 min, en body) y **refresh token** (7 días, en cookie httpOnly).
- El access token se guarda en `localStorage` y se adjunta automáticamente via interceptor de Axios en el header `Authorization: Bearer <token>`.
- El payload del JWT contiene `{ id, nombre, email, rol }` — nunca la contraseña.
- Las contraseñas se hashean con bcryptjs (factor de costo 12).

### Permisos por rol

| Acción | Estudiante | Tutor | Admin |
|---|---|---|---|
| Crear turno | Sí (propio) | No | Sí |
| Ver turnos | Sí | Sí | Sí |
| Cancelar turno | Solo el propio | Solo los asignados | Todos |
| Confirmar turno | No | Solo los asignados | Todos |
| Marcar realizado | No | Solo los asignados | Todos |
| Ver resumen | No | No | Sí |

---

## Ejecutar tests

```bash
cd backend
npm test
```

Cubre 19 casos: login correcto e inválido, registro, listado con y sin filtros, detalle existente e inexistente, creación válida, horario inconsistente, superposición, tutor inactivo, día no disponible, acceso sin token, acceso con rol insuficiente y reasignación a tutor ocupado.

---

## Limitaciones conocidas

- El refresh token no se invalida en base de datos al hacer logout (no hay blacklist). En producción se requeriría persistir los tokens revocados.
- Las rutas de frontend protegen el acceso visual pero la fuente de verdad de seguridad es siempre el backend.
- Los tests usan una base de datos en memoria separada (`sync({ force: true })`) para no afectar los datos de desarrollo.
