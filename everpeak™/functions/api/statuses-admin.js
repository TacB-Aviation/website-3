export async function onRequestGet({ env }) {
  const raw = await env.AVAILABILITY_KV.get('statuses');
  return new Response(raw || '{}', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestPost({ request, env }) {
  // Cloudflare Access injects this header after verifying the user.
  // If it's missing the request never reached here through Access — reject it.
  const cfEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!cfEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.AVAILABILITY_KV.put('statuses', JSON.stringify(body));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
