import { NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export class ProxyCartMiddleware implements NestMiddleware {
  private proxy = createProxyMiddleware({
    target: process.env.CART,
    pathRewrite: {
      '/cart': '/',
    },
    changeOrigin: true,
    secure: false,
    // onProxyReq: (proxyReq, req, res) => {
    //   //console.log(proxyReq);
    //   // console.log(
    //   //   `[NestMiddleware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
    //   // );
    // },
  });
  use(req: Request, res: Response, next: () => void) {
    //console.log(res);
    this.proxy(req, res, next);
  }
}
