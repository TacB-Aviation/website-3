// functions/_lib.js
// Shared helpers used by the gallery + admin functions.
// Filename starts with "_" so Cloudflare Pages does NOT treat it as a route.

export async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function slugify(input) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// Renders the small, on-brand password-gate page.
export function renderPasswordGate({ clientName, error }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${clientName} — Private Gallery | Everpeak Visuals</title>
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 50% 0%, var(--charcoal-2), var(--charcoal) 70%);
    font-family: "Work Sans", sans-serif;
    color: var(--paper);
    padding: 24px;
  }
  .card {
    width: 100%;
    max-width: 400px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(201,161,90,0.25);
    border-radius: 14px;
    padding: 40px 32px;
    text-align: center;
    backdrop-filter: blur(6px);
  }
  h1 {
    font-family: "Fraunces", serif;
    font-weight: 600;
    font-size: 1.5rem;
    margin: 0 0 6px;
    color: var(--brass-soft);
  }
  p.sub {
    margin: 0 0 28px;
    font-size: 0.9rem;
    color: rgba(236,231,220,0.6);
    letter-spacing: 0.02em;
  }
  input[type="password"] {
    width: 100%;
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid rgba(201,161,90,0.35);
    background: rgba(0,0,0,0.25);
    color: var(--paper);
    font-family: "Work Sans", sans-serif;
    font-size: 1rem;
    margin-bottom: 14px;
  }
  input[type="password"]:focus {
    outline: 2px solid var(--brass);
    outline-offset: 1px;
  }
  button {
    width: 100%;
    padding: 12px 14px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, var(--brass), var(--brass-soft));
    color: #1a1a1a;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    cursor: pointer;
  }
  button:hover { filter: brightness(1.05); }
  .error {
    color: #e08a8a;
    font-size: 0.85rem;
    margin: -6px 0 14px;
  }
  .brand {
    margin-top: 28px;
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(236,231,220,0.35);
  }
</style>
</head>
<body>
  <div class="card">
    <h1>${clientName}</h1>
    <p class="sub">This gallery is private. Enter the password you were given to view it.</p>
    <form method="POST">
      <input type="password" name="password" placeholder="Gallery password" required autofocus>
      ${error ? `<div class="error">${error}</div>` : ""}
      <button type="submit">View gallery</button>
    </form>
    <div class="brand">Everpeak Visuals</div>
  </div>
</body>
</html>`;
}

export function renderNotFound() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Gallery not found</title>
<style>
  body { background:#17181b; color:#ece7dc; font-family: sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; text-align:center; }
</style></head>
<body><div><h1>Gallery not found</h1><p>Check the link and try again.</p></div></body></html>`;
}
