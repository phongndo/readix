export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
  WORKSPACE: (id: string) => `/workspace/${id}`,
  LIBRARY: '/library',
  ABOUT: '/about',
} as const;
