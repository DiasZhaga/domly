// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/v1': '/api/v1' },
    })
  );

  app.use(
    '/ads-photos',
    createProxyMiddleware({
      target: 'http://localhost:9000',  
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/ads-photos': '/ads-photos',
      },
    })
  );
};
