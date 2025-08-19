# Óleo Fino — Tienda de óleos online

Sitio web estático (HTML/CSS/JS) listo para subir a GitHub y publicar con **GitHub Pages**.
Incluye carrito, catálogo, filtros, búsquedas, detalle de producto y checkout simulado (sin pagos).

## Demo local

```bash
# 1) Abrir un servidor estático (opción simple con Python)
python3 -m http.server 8000

# 2) Visitar
http://localhost:8000
```

> Si lo abres como archivo (`file://`) algunas funciones (fetch de JSON) pueden no cargar por políticas del navegador.
> Por eso es mejor levantar un servidor estático local.

## Estructura

```
.
├── index.html
├── styles.css
├── app.js
├── /data/products.json
├── /assets/img/...
└── /.github/workflows/pages.yml  # despliegue automático
```

## Despliegue en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `oleo-fino`).
2. Sube todos los archivos de este proyecto.
3. Asegúrate de que la rama por defecto sea `main`.
4. El workflow en `.github/workflows/pages.yml` publicará automáticamente en GitHub Pages.
   - Ve a **Settings → Pages** y comprueba que la fuente es **GitHub Actions**.
5. La web quedará disponible en `https://TU_USUARIO.github.io/NOMBRE_REPO/`.

### Personalizar marca/contenido
- Cambia el nombre de la tienda en `index.html` y en `app.js` (const STORE).
- Reemplaza imágenes en `assets/img` y el catálogo en `data/products.json`.
- Edita colores y tipografías en `styles.css`.

## Licencia
MIT — Úsalo, cámbialo y publícalo libremente.
