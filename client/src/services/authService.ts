// client/src/services/authService.ts

// In a real implementation, this would interact with Clerk or another auth provider
export const authService = {
  // Get the current user's auth token
  getAuthToken: (): string | null => {
    // In a real implementation, you would get the token from Clerk or another auth provider
    // For example: return await Clerk.session.getToken();

    // For now, returning null since we're relying on Clerk's default behavior
    return null;
  },

  // Check if the user is authenticated
  isAuthenticated: (): boolean => {
    // In a real implementation, you would check the Clerk client
    // For example: return !!Clerk.user;
    return true; // Assume authenticated for now
  },
};

/**
 * Authenticated fetch wrapper
 * Makes API calls with authentication headers
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = authService.getAuthToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}