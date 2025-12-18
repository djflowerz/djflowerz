import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export const ADMIN_EMAIL = 'ianmuriithiflowerz@gmail.com';

/**
 * Ensures the user is the specific admin.
 * To be used in Server Components or API routes.
 */
export async function ensureAdmin() {
    const session = await getSession();
    if (!session || session.user?.email !== ADMIN_EMAIL) {
        redirect('/');
    }
    return session.user;
}

/**
 * Client-side check for admin status.
 */
export function isAdmin(user: any) {
    return user?.email === ADMIN_EMAIL;
}
