const req = require.context('@/assets/icons/svg/', false, /\.svg$/);
req.keys().map(req);
export {};