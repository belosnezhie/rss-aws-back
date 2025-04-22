import { NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export class ProxyCartMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyCartMiddleware.name);

  private simpleRequestLogger = (proxyServer, options) => {
    proxyServer.on('proxyReq', (proxyReq, req, res) => {
      this.logger.log(`Request headers:`);
      this.logger.log(req.headers);
      this.logger.log(`[HPM] [${req.method}] ${req.baseUrl} + ${req.url}`); // outputs: [HPM] GET /users
    });
  };

  private proxy = createProxyMiddleware({
    target: process.env.CART,
    pathRewrite: {
      '^/cart': '',
    },
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    plugins: [this.simpleRequestLogger]
  });
  use(req: Request, res: Response, next: () => void) {
    delete req.headers['host'];
    delete req.headers['connection'];
    delete req.headers['content-length'];
    this.proxy(req, res, next);
  }
}
