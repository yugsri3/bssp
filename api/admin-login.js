const crypto = require('crypto');

const COOKIE_NAME = 'bssp_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function isValidSession(cookie, secret) {
  if (!cookie) return false;
  const parts = cookie.split('.');
  if (parts.length !== 2) return false;
  const [expires, signature] = parts;
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  const expected = sign(expires, secret);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function parseCookies(header) {
  return Object.fromEntries((header || '').split(';').map(part => {
    const index = part.indexOf('=');
    return index === -1 ? ['', ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

function setSessionCookie(res, secret) {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = `${expires}.${sign(String(expires), secret)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secure}`);
}

module.exports = (req, res) => {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !sessionSecret) {
    return res.status(500).json({ error: 'Admin authentication is not configured.' });
  }

  const cookies = parseCookies(req.headers.cookie);
  if (req.method === 'GET') {
    return res.status(isValidSession(cookies[COOKIE_NAME], sessionSecret) ? 200 : 401).json({ authenticated: isValidSession(cookies[COOKIE_NAME], sessionSecret) });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const supplied = typeof body?.password === 'string' ? body.password : '';
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(password);
  const valid = suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
  if (!valid) return res.status(401).json({ error: 'Invalid password.' });

  setSessionCookie(res, sessionSecret);
  return res.status(200).json({ authenticated: true });
};
