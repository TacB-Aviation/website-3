// functions/admin/galleries.js
//
// Powers the admin page at /admin/index.html.
// Protected by the ADMIN_KEY environment variable — every request must
// include header:   X-Admin-Key: <your admin key>
//
// POST   /admin/galleries    -> create a new gallery (multipart/form-data)
// GET    /admin/galleries    -> list existing galleries (no passwords returned)
// DELETE /admin/galleries?slug=xyz -> delete a gallery + its photos

import { sha256Hex, slugify } from "../_lib.js";

function checkAdmin(request, env) {
  const key = request.headers.get("X-Admin-Key");
  return key && env.ADMIN_KEY && key === env.ADMIN_KEY;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!checkAdmin(request, env)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const form = await request.formData();
  const clientName = (form.get("clientName") || "").toString().trim();
  const rawSlug = (form.get("slug") || "").toString().trim();
  const password = (form.get("password") || "").toString();
  const files = form.getAll("images").filter((f) => f && f.size > 0);

  if (!clientName || !password) {
    return json({ error: "Client name and password are required." }, 400);
  }

  const slug = slugify(rawSlug || clientName);
  if (!slug) {
    return json({ error: "Could not build a valid URL slug from that name." }, 400);
  }

  const existing = await env.GALLERIES.get(slug);
  if (existing) {
    return json({ error: `A gallery already exists at /gallery/${slug}. Choose a different name or slug.` }, 409);
  }

  const imageNames = [];
  for (const file of files) {
    const safeName = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}${extOf(file.name)}`;
    await env.GALLERY_IMAGES.put(`${slug}/${safeName}`, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });
    imageNames.push(safeName);
  }

  const record = {
    clientName,
    passwordHash: await sha256Hex(password),
    images: imageNames,
    createdAt: new Date().toISOString(),
  };

  await env.GALLERIES.put(slug, JSON.stringify(record));

  return json({ ok: true, slug, url: `/gallery/${slug}`, photoCount: imageNames.length });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!checkAdmin(request, env)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const list = await env.GALLERIES.list();
  const galleries = [];
  for (const key of list.keys) {
    const record = await env.GALLERIES.get(key.name, { type: "json" });
    if (record) {
      galleries.push({
        slug: key.name,
        clientName: record.clientName,
        photoCount: (record.images || []).length,
        createdAt: record.createdAt,
        url: `/gallery/${key.name}`,
      });
    }
  }
  galleries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return json({ galleries });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!checkAdmin(request, env)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return json({ error: "Missing slug" }, 400);

  const record = await env.GALLERIES.get(slug, { type: "json" });
  if (record) {
    for (const filename of record.images || []) {
      await env.GALLERY_IMAGES.delete(`${slug}/${filename}`);
    }
  }
  await env.GALLERIES.delete(slug);

  return json({ ok: true });
}

function extOf(filename) {
  const match = /\.[^.]+$/.exec(filename || "");
  return match ? match[0].toLowerCase() : "";
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
