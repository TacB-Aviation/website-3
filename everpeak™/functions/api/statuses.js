export async function onRequestGet({ env }) {
  const raw = await env.AVAILABILITY_KV.get('statuses');
  const data = raw ? raw : '{}';
  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
