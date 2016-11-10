/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import fs = require('fs');
import path = require('path');
import http = require('http');
import util = require('util');
import browserify = require('browserify');
import express = require('express');
import open = require('open');
import WebSocket = require('ws');
import colors = require('colors');
import watch = require('watch');

// 扩展 Request 对象
interface Request extends express.Request {
  filename: string;
  pathname: string;
}

// 打印日志
function log(...args: any[]) {
  console.log('%s - %s',
    new Date().toLocaleTimeString(),
    colors.green(util.format(args[0], ...args.slice(1))));
}

// 打包日志文件
function bundleFile(file: string, callback: (err: Error, buf?: Buffer) => void) {
  fs.exists(file, ok => {
    if (!ok) return callback(new Error(`文件 ${ file } 不存在`));
    log('打包文件 %s', file);
    const s = process.uptime();
    const b = browserify();
    b.add(file).bundle((err: Error, buf: Buffer) => {
      if (err) {
        log('打包文件 %s 出错：%s', file, colors.yellow(err.stack));
        return callback(err);
      }
      log('打包文件 %s 完成，耗时 %s 秒', file, (process.uptime() - s).toFixed(3));
      callback(null, buf);
    });
  });
}

// 启动服务器
export = function (options: {
  dir: string,
  watchDir: string,
  port: number,
  host: string,
  openOnBrowser: boolean,
}) {

  const server = http.createServer();
  const wss = new WebSocket.Server({ server });
  const app = express();

  // 广播消息给所有客户端
  function broadcast(data: string) {
    wss.clients.forEach(client => {
      client.send(data);
    });
  }

  // 监听文件变化
  if (options.watchDir) {
    watch.watchTree(options.watchDir, {
      ignoreDotFiles: true,
      interval: 1,
    }, (file) => {
      if (typeof file === 'string') {
        log('文件改变 %s', file);
        broadcast(`fileChanged:${ file }`);
      }
    });
  }

  // 根据请求生成绝对文件名
  app.use(function (req: Request, res: express.Response, next: express.NextFunction) {
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
  app.use('/-/reload.js', function (req: Request, res: express.Response, next: express.NextFunction) {
    bundleFile(path.resolve(__dirname, 'reload.js'), (err, buf) => {
      res.setHeader('content-type', 'text/javascript');
      res.end(buf);
    });
  });

  // js文件
  app.use(function (req: Request, res: express.Response, next: express.NextFunction) {
    if (req.filename.slice(-3) !== '.js') return next();
    bundleFile(req.filename, (err, buf) => {
      if (err) return next(err);
      res.setHeader('content-type', 'text/javascript');
      res.end(buf);
    });
  });

  // html文件
  app.use(function (req: Request, res: express.Response, next: express.NextFunction) {
    if (req.filename.slice(-5) !== '.html') return next();
    fs.readFile(req.filename, (err, buf) => {
      if (err) return next(err);
      // 响应页面
      res.setHeader('content-type', 'text/html');
      res.write(buf);
      // 插入自动刷新页面的脚本
      if (options.watchDir) {
        res.write(`
<!-- 文件修改后自动刷新页面 -->
<script type="text/javascript" src="/-/reload.js"></script>
        `);
      }
      res.end();
    });
  });

  // 其它所有文件
  app.use(express.static(options.dir));

  // 文件不存在
  app.use(function (req: Request, res: express.Response, next: express.NextFunction) {
    res.statusCode = 404;
    res.setHeader('content-type', 'text/html');
    res.end(`<h1>文件 ${ req.filename } 不存在</h1>`);
  });

  // 出错
  app.use(function (err: Error, req: Request, res: express.Response, next: express.NextFunction) {
    res.statusCode = 500;
    res.end(err.stack);
  });

  // 监听端口
  server.on('request', app);
  server.listen(options.port, (err: Error) => {
    if (err) throw err;
    log('服务器已启动');

    if (options.openOnBrowser) {
      const url = `http://${ options.host === '0.0.0.0' ? '127.0.0.1' : options.host }:${ options.port }`;
      log('在浏览器打开 %s', url);
      open(url);
    }
  });

  // 监听全局错误
  process.on('uncaughtException', (err: Error) => {
    log('uncaughtException: %s', colors.red(err.stack));
  });
  process.on('unhandledRejection', (err: Error) => {
    log('unhandledRejection: %s', colors.red(err.stack));
  });
};
