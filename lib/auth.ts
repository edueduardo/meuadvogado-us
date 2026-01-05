import { NextRequest } from 'next/server';

/**
 * Extract authenticated user ID from request
 *
 * STUB: Awaits implementation of authentication system
 *
 * Current state:
 * - No authentication system implemented
 * - Endpoints that require auth are blocked with 401
 * - This function returns null (no users authenticated)
 *
 * When authentication is implemented, this function should:
 * 1. Extract session/token from request headers or cookies
 * 2. Verify session/token validity
 * 3. Return user ID if valid, null if invalid
 *
 * Example implementations:
 * - NextAuth: extract session from getSession()
 * - JWT: decode and verify token from Authorization header
 * - Custom: check session cookie and database
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    // TODO: Implement actual authentication logic
    // Placeholder implementation:
    // const session = await getSession({ req: request });
    // return session?.user?.id ?? null;

    // Current stub: always returns null (no authentication)
    return null;
  } catch (error) {
    console.error('Error in getUserFromRequest:', error);
    return null;
  }
}

/**
 * Extract authenticated user email from request
 *
 * Used for Stripe checkout and user identification
 */
export async function getUserEmailFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    // TODO: Implement actual authentication logic
    // Placeholder implementation:
    // const session = await getSession({ req: request });
    // return session?.user?.email ?? null;

    // Current stub: always returns null
    return null;
  } catch (error) {
    console.error('Error in getUserEmailFromRequest:', error);
    return null;
  }
}

/**
 * Verify user is authenticated
 *
 * Used to guard protected endpoints
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userId = await getUserFromRequest(request);

  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  return userId;
}
