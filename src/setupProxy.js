const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    proxy('/admin', {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      pathRewrite: {'^/admin': ''}
    })
  );
};