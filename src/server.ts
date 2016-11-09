/**
 * Dev-Server
 * 
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import fs = require('fs');
import path = require('path');
import util = require('util');
import browserify = require('browserify');
import express = require('express');
import open = require('open');
import ws = require('ws');
import colors = require('colors');


interface Request extends express.Request {
  filename: string;
  pathname: string;
}

function log(...args: any[]) {
  console.log('%s - %s',
    new Date().toLocaleTimeString(),
    colors.green(util.format(args[0], ...args.slice(1))));
}

export = function (options: {
  dir: string,
  watchDir: string,
  port: number,
  host: string,
}) {

  const app = express();

  app.use(function (req: Request, res, next) {
    const i = req.url.indexOf('?');
    if (i === -1) {
      req.pathname = req.url;
    } else {
      req.pathname = req.url.slice(0, i);
    }
    if (req.pathname === '/') req.pathname = '/index.html';
    req.filename = path.resolve(options.dir, req.pathname.slice(1));
    log('%s %s', req.method, req.url);
    next();
  });

  // reload.js
  app.use('/-/reload.js', function (req, res: express.Response, next) {
    res.setHeader('content-type', 'text/javascript');
    res.end(`alert('ok')`);
  });

  // js文件
  app.use(function (req: Request, res, next) {
    if (req.filename.slice(-3) !== '.js') return next();
    fs.exists(req.filename, ok => {
      if (!ok) return next();
      const b = browserify();
      b.add(req.filename).bundle((err, buf) => {
        if (err) return next(err);
        log('打包文件 %s', req.filename);
        res.end(buf);
      });
    });
  });

  // html文件
  app.use(function (req: Request, res: express.Response, next) {
    if (req.filename.slice(-5) !== '.html') return next();
    fs.readFile(req.filename, (err, buf) => {
      if (err) return next(err);
      // 响应页面
      res.setHeader('content-type', 'text/html');
      res.write(buf);
      // 插入自动刷新页面的脚本
      if (options.watchDir) {
        res.write(`<script type="text/javascript" src="/-/reload.js"></script>`);
      }
      res.end();
    });
  });

  // 其它所有文件
  app.use(express.static(options.dir));

  // 监听端口
  app.listen(options.port, err => {
    if (err) throw err;
    // open(`http://${ options.host }:${ options.port }/index.html`);
    log('服务器已启动');
  });

};
