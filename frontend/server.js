// optional express server to serve next and proxy api during development
const { createServer } = require('http');
const next = require('next');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
app.prepare().then(()=> {
  const server = express();

  // proxy api calls to backend if desired
  server.use('/api', createProxyMiddleware({ target: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000', changeOrigin: true, pathRewrite: {'^/api':''} }));

  server.all('*', (req,res) => handle(req,res));
  const port = parseInt(process.env.PORT,10) || 3000;
  server.listen(port, ()=> console.log('Next server listening on', port));
});
