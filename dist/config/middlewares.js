"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
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
                        'https://*.basemaps.cartocdn.com'
                    ],
                    'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
                    upgradeInsecureRequests: null,
                },
            },
        },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
