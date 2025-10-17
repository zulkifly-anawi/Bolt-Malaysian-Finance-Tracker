export const AUTHORIZED_ADMIN_EMAIL = 'zulkifly.anawi@gmail.com';

export function isAuthorizedAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}
