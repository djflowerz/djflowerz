import { redirect } from 'next/navigation';
// Note: verifyAdmin would usually happen in Middleware or effectively on the client if using client-side auth
// For server-side checks in Next.js 14+ without ssr package, we might need a different approach or rely on client-side protection for now.

export const ADMIN_EMAIL = 'ianmuriithiflowerz@gmail.com';

/**
 * Checks if the user object has the admin email.
 * This is primarily a client-side check or a check after fetching user data.
 */
export function isAdmin(user: any) {
    return user?.email === ADMIN_EMAIL;
}

/**
 * Placeholder for server-side assurance if needed. 
 * Currently reliance is on client-side protection or middleware.
 */
export async function ensureAdmin() {
    // In a full implementation with @supabase/ssr, we would get the session from cookies here.
    // Since we are refactoring from client-side Auth0, and AdminPage is 'use client',
    // we will rely on client-side redirection in the component.
    return null;
}
