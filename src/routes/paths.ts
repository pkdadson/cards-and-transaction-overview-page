export const PATHS = {
  home: '/',
  login: '/login',
  card: {
    pattern: ':cardId',
    to: (cardId: string) => `/${cardId}`,
  },
  notFound: '*',
} as const;
