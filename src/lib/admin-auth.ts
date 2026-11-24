import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MakeTheirDay2026!';
const TOKEN_SECRET = 'mtd_admin_secret_auth_token_2026';

export function getAdminPassword(): string {
  return ADMIN_PASSWORD;
}

export function generateAdminToken(): string {
  return Buffer.from(`${TOKEN_SECRET}:${ADMIN_PASSWORD}:${Date.now()}`).toString('base64');
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [secret, pass] = decoded.split(':');
    return secret === TOKEN_SECRET && pass === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export function isAuthorizedAdmin(request: Request): boolean {
  // Check header
  const authHeader = request.headers.get('x-admin-token');
  if (verifyAdminToken(authHeader)) {
    return true;
  }

  // Check cookie
  try {
    const cookieStore = cookies();
    const cookieToken = cookieStore.get('mtd_admin_session')?.value;
    return verifyAdminToken(cookieToken);
  } catch {
    return false;
  }
}
