import { NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export class ProxyProductMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyProductMiddleware.name);

  private proxy = createProxyMiddleware({
    target: process.env.PRODUCT,
    pathRewrite: {
      '/product': '/',
    },
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
  use(req: Request, res: Response, next: () => void) {
    console.log(res);
    this.logger.log(`Got invoked: '${req.originalUrl}'`);
    this.logger.log(`Incoming request URL: ${req.url}`);
    this.logger.log(`Target URL: ${process.env.PRODUCT}`);
    this.proxy(req, res, next);
  }
}
