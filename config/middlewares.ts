export default ({ env }) => {
  const raw = env('STRAPI_ALLOWED_ORIGINS', '');
  const origin = raw
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  const cors =
    origin.length > 0
      ? {
          name: 'strapi::cors',
          config: {
            origin,
          },
        }
      : 'strapi::cors';

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': [
              "'self'",
              'data:',
              'blob:',
              'market-assets.strapi.io',
              'tile.openstreetmap.org',
              'a.tile.openstreetmap.org',
              'b.tile.openstreetmap.org',
              'c.tile.openstreetmap.org',
              'https://*.basemaps.cartocdn.com',
            ],
            'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    cors,
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
