// functions/gallery-img/[slug]/[filename].js
//
// Serves one photo out of the R2 bucket for a private gallery.
// Requires the same valid session cookie the main gallery page sets,
// so photos can't be pulled by guessing filenames without the password.

import { hmacHex, getCookie } from "../../_lib.js";

export async function onRequestGet(context) {
  const { params, env, request } = context;
  const { slug, filename } = params;

  const record = await env.GALLERIES.get(slug, { type: "json" });
  if (!record) return new Response("Not found", { status: 404 });

  const cookieVal = getCookie(request, `gallery_auth_${slug}`);
  const expected = await hmacHex(env.GALLERY_SECRET, `${slug}:${record.passwordHash}`);
  if (cookieVal !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  const object = await env.GALLERY_IMAGES.get(`${slug}/${filename}`);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "private, max-age=3600");
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
