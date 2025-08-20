const CONFIG: Record<string, Record<string, string>> = {
  development: {
    baseUrl: '/api',
  },
  production: {
    baseUrl: '/snow-gallery',
  },
};
export const config = (key: string): string => {
  return CONFIG[import.meta.env.MODE][key];
};