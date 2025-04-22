import { NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export class ProxyCartMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyCartMiddleware.name);

  private proxy = createProxyMiddleware({
    target: process.env.CART,
    pathRewrite: {
      '/cart': '/',
    },
    changeOrigin: true,
    secure: false,
  });
  use(req: Request, res: Response, next: () => void) {
    console.log(res);
    this.logger.log(`Got invoked: '${req.originalUrl}'`);
    this.logger.log(`Incoming request URL: ${req.url}`);
    this.logger.log(`Target URL: ${process.env.PRODUCT}`);
    this.logger.log({
      originalUrl: req.originalUrl,
      path: req.path,
      method: req.method,
      headers: req.headers
    });
    this.proxy(req, res, next);
  }
}
