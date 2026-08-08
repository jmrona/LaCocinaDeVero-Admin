# La Cocina de Vero — CMS

Panel de administración (Strapi 5) para la web de [La Cocina de Vero](https://lacocinadevero.es).
Permite editar el menú, los testimonios y los textos del sitio sin tocar código.

> Este repositorio contenía antes un panel a medida hecho con Astro + Clerk.
> Ese código sigue disponible en el historial de git (ver commits anteriores a la
> migración a Strapi).

## Qué se puede editar

| Sección | Contenido |
|---|---|
| **Dishes** | Platos: nombre (es/en/de), precio, foto, categorías, alérgenos y si aparece como destacado en la home |
| **Categories** | Categorías del menú y los días de la semana (estos últimos alimentan el "menú del día") |
| **Allergens** | Los 14 alérgenos oficiales y su icono |
| **Testimonials** | Reseñas de clientes que salen en la home |
| **Site copy** | Todos los textos de marketing en los 3 idiomas |
| **Business info** | Teléfono, dirección, horario y redes sociales |

## Puesta en marcha

```bash
pnpm install
cp .env.example .env   # y rellenar los valores
pnpm run develop
```

El panel queda en http://localhost:1337/admin

### Variables de entorno

Todas se documentan en `.env.example`. Las que hay que conseguir del panel de Supabase:

- `DATABASE_URL` — Project Settings → Database → Connection string (URI)
- `SUPABASE_STORAGE_*` — Project Settings → Storage → S3 access keys

Los secretos (`APP_KEYS`, `JWT_SECRET`, …) se generan con `openssl rand -base64 32`.

## Notas sobre la base de datos

- Comparte la base de datos Postgres de Supabase con la web.
- Las tablas que gestiona Strapi llevan el prefijo `cms_` (`cms_dishes`, `cms_categories`, …).
  Las tablas originales sin prefijo se conservan intactas como respaldo.
- Las tablas `cms_*` tienen RLS activado en modo solo-lectura para el público: la web
  puede leerlas con la clave anónima, pero nadie puede escribir sin autenticación.
- Las fotos van a Supabase Storage (bucket `dishes`). Al subir una imagen en el campo
  `photo` de un plato, su URL pública se copia automáticamente al campo `image`,
  que es el que lee la web.
