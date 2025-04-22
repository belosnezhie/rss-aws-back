import { NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export class ProxyCartMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyCartMiddleware.name);

  private simpleRequestLogger = (proxyServer, options) => {
    proxyServer.on('proxyReq', (proxyReq, req, res) => {
      console.log(`[HPM] [${req.method}] ${req.url}`); // outputs: [HPM] GET /users
    });
  };

  private proxy = createProxyMiddleware({
    target: process.env.CART,
    pathRewrite: {
      '^/cart': '/',
    },
    changeOrigin: true,
    secure: false,
    plugins: [this.simpleRequestLogger]
  });
  use(req: Request, res: Response, next: () => void) {
    console.log(res);
    this.logger.log(`Got invoked: '${req.originalUrl}'`);
    this.logger.log(`Incoming request URL: ${req.url}`);
    this.logger.log(`Target URL: ${process.env.CART}`);
    this.logger.log({
      originalUrl: req.originalUrl,
      path: req.path,
      method: req.method,
      headers: req.headers
    });
    this.proxy(req, res, next);
  }
}
