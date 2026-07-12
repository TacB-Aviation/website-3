// functions/gallery/[slug].js
//
// This ONE file powers every private gallery URL:
//   everpeakvisuals.com/gallery/whatever-slug-you-choose
//
// No per-client HTML file is ever created. The gallery's name, password,
// and photo list live in Cloudflare KV (namespace binding: GALLERIES).
// The actual photo files live in R2 (bucket binding: GALLERY_IMAGES) and
// are streamed back out by functions/gallery-img/[slug]/[filename].js
//
// Requires these bindings in your Cloudflare Pages project settings:
//   - KV namespace bound as   GALLERIES
//   - R2 bucket bound as      GALLERY_IMAGES
//   - Environment variable    GALLERY_SECRET   (any long random string)

import { sha256Hex, hmacHex, getCookie, renderPasswordGate, renderNotFound } from "../_lib.js";

const SESSION_HOURS = 12;

export async function onRequestGet(context) {
  const { params, env, request } = context;
  const slug = params.slug;

  const record = await env.GALLERIES.get(slug, { type: "json" });
  if (!record) {
    return new Response(renderNotFound(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  const cookieVal = getCookie(request, `gallery_auth_${slug}`);
  const expected = await hmacHex(env.GALLERY_SECRET, `${slug}:${record.passwordHash}`);

  if (cookieVal === expected) {
    return new Response(renderGallery(slug, record), {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  return new Response(renderPasswordGate({ clientName: record.clientName }), {
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  });
}

export async function onRequestPost(context) {
  const { params, env, request } = context;
  const slug = params.slug;

  const record = await env.GALLERIES.get(slug, { type: "json" });
  if (!record) {
    return new Response(renderNotFound(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  const form = await request.formData();
  const submitted = (form.get("password") || "").toString();
  const submittedHash = await sha256Hex(submitted);

  if (submittedHash !== record.passwordHash) {
    return new Response(
      renderPasswordGate({ clientName: record.clientName, error: "Incorrect password. Try again." }),
      { status: 401, headers: { "Content-Type": "text/html; charset=UTF-8" } }
    );
  }

  const sessionValue = await hmacHex(env.GALLERY_SECRET, `${slug}:${record.passwordHash}`);
  const headers = new Headers({ "Content-Type": "text/html; charset=UTF-8" });
  headers.append(
    "Set-Cookie",
    `gallery_auth_${slug}=${encodeURIComponent(sessionValue)}; Path=/gallery/${slug}; Max-Age=${
      SESSION_HOURS * 3600
    }; HttpOnly; Secure; SameSite=Lax`
  );

  return new Response(renderGallery(slug, record), { headers });
}

function renderGallery(slug, record) {
  const images = record.images || [];
  const imgTags = images
    .map(
      (filename) =>
        `<a class="frame" href="/gallery-img/${slug}/${encodeURIComponent(filename)}" target="_blank" rel="noopener">
           <img src="/gallery-img/${slug}/${encodeURIComponent(filename)}" loading="lazy" alt="${record.clientName} photo">
         </a>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${record.clientName} — Gallery | Everpeak Visuals</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Work+Sans:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --charcoal: #17181b;
    --charcoal-2: #1f2024;
    --brass: #c9a15a;
    --brass-soft: #e4c98a;
    --paper: #ece7dc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--charcoal);
    color: var(--paper);
    font-family: "Work Sans", sans-serif;
  }
  header {
    padding: 48px 24px 28px;
    text-align: center;
    border-bottom: 1px solid rgba(201,161,90,0.15);
  }
  header h1 {
    font-family: "Fraunces", serif;
    font-weight: 600;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    margin: 0 0 6px;
    color: var(--brass-soft);
  }
  header p {
    margin: 0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: rgba(236,231,220,0.5);
  }
  .masonry {
    column-count: 4;
    column-gap: 14px;
    padding: 28px;
    max-width: 1400px;
    margin: 0 auto;
  }
  @media (max-width: 1100px) { .masonry { column-count: 3; } }
  @media (max-width: 720px)  { .masonry { column-count: 2; } }
  @media (max-width: 460px)  { .masonry { column-count: 1; } }
  .frame {
    display: block;
    break-inside: avoid;
    margin-bottom: 14px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(201,161,90,0.12);
  }
  .frame img {
    width: 100%;
    display: block;
    transition: transform 0.3s ease;
  }
  .frame:hover img { transform: scale(1.02); }
  .empty {
    text-align: center;
    padding: 60px 20px;
    color: rgba(236,231,220,0.5);
  }
  footer {
    text-align: center;
    padding: 30px;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(236,231,220,0.3);
  }
</style>
</head>
<body>
  <header>
    <h1>${record.clientName}</h1>
    <p>Private gallery &middot; Everpeak Visuals</p>
  </header>
  ${
    images.length
      ? `<div class="masonry">${imgTags}</div>`
      : `<div class="empty">Photos are still being uploaded — check back soon.</div>`
  }
  <footer>&copy; Everpeak Visuals</footer>
</body>
</html>`;
}
