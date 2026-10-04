# John Mike Martin Portfolio - React + Vite (JavaScript)

This version is rebuilt for React + Vite using JavaScript only.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints, normally http://localhost:5173/.

## File types

- React components: `.jsx`
- JavaScript modules/config: `.js`
- No `.ts` or `.tsx` source files are included.

The original public images and styling assets are preserved in `public/`.

## Service detail routes
The homepage **Learn more** buttons now open the matching Vite SPA routes:
- `/services/custom-software`
- `/services/ai-automation`

Vite's development server serves these routes through the SPA fallback. For production hosting, configure your host to rewrite unknown routes to `/index.html`.

## Portfolio project added
- Lumispire — https://lumispire.online/
- Work card: `/work`
- Case study: `/work/lumispire`
