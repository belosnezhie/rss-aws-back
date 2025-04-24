import { NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export class ProxyProductMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyProductMiddleware.name);

  private proxy = createProxyMiddleware({
    target: process.env.PRODUCT,
    pathRewrite: {
      '^/product': '/',
    },
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'X-Forwarded-Proto': 'https'
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('X-Forwarded-Proto', 'https');
      },
      proxyRes: (proxyRes, req, res) => {
        this.logger.log('Proxy Response Status:', proxyRes.statusCode);
        this.logger.log('Proxy Response Headers:', proxyRes.headers);
      },
      error: (err, req, res) => {
        this.logger.error('Proxy Error:', err);
      },
    },
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
