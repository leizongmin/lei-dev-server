declare module "http-proxy-middleware" {
  import * as express from 'express';
  interface Proxy {
    (target: string): express.RequestHandler;
  }
  const proxy: Proxy;
  export = proxy;
}