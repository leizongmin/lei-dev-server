/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as util from "util";
import * as express from "express";
import open = require("open");
import * as WebSocket from "ws";
import * as colors from "colors";
import * as watch from "watch";
import * as mime from "mime";
import { bundle } from "./bundle";

mime.define({
  "text/css": [ "css", "less" ],
});

// 扩展 Request 对象
interface IRequest extends express.Request {
  filename: string;
  pathname: string;
}

// 打印日志
function log(...args: any[]) {
  console.log("%s - %s",
    new Date().toLocaleTimeString(),
    colors.green(util.format(args[0], ...args.slice(1))));
}

// 启动服务器
export default function (options: {
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
      if (typeof file === "string") {
        log("文件改变 %s", file);
        broadcast(`fileChanged:${ file }`);
      }
    });
  }

  // 根据请求生成绝对文件名
  app.use(function (req: IRequest, res: express.Response, next: express.NextFunction) {
    const i = req.url.indexOf("?");
    if (i === -1) {
      req.pathname = req.url;
    } else {
      req.pathname = req.url.slice(0, i);
    }
    if (req.pathname === "/") {
      req.pathname = "/index.html";
    }
    req.filename = path.resolve(options.dir, req.pathname.slice(1));
    log("%s %s", req.method, req.url);
    next();
  });

  // html文件
  app.use(function (req: IRequest, res: express.Response, next: express.NextFunction) {
    if (req.filename.slice(-5) !== ".html") {
      return next();
    }
    fs.readFile(req.filename, (err, buf) => {
      if (err) {
        return next(err);
      }
      // 响应页面
      res.setHeader("content-type", "text/html");
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

  // reload.js
  app.use("/-/reload.js", function (req: IRequest, res: express.Response, next: express.NextFunction) {
    req.filename = path.resolve(__dirname, "reload.js");
    next();
  });

  // 打包文件
  app.use(function (req: IRequest, res: express.Response, next: express.NextFunction) {
    // 不打包 node_modules 目录下的任何文件
    if (req.filename.indexOf("/node_modules/") !== -1) {
      return next();
    }
    const t = process.uptime();
    bundle(req.filename, (err: Error, data: Buffer | string) => {
      if (err) {
        return next(err);
      }
      if (data === null) {
        return next();
      }
      log("打包文件 %s (耗时%ss)", req.filename, (process.uptime() - t).toFixed(3));
      res.setHeader("content-type", mime.lookup(req.filename));
      res.end(data);
    });
  });

  // 其它所有文件
  app.use(express.static(options.dir));

  // 文件不存在
  app.use(function (req: IRequest, res: express.Response, next: express.NextFunction) {
    res.statusCode = 404;
    res.setHeader("content-type", "text/html");
    res.end(`<h1>文件 ${ req.filename } 不存在</h1>`);
  });

  // 出错
  app.use(function (err: Error, req: IRequest, res: express.Response, next: express.NextFunction) {
    res.statusCode = 500;
    res.end(err.stack);
    log("%s %s 出错：%s", req.method, req.url, colors.yellow(err.stack || ""));
  });

  // 监听端口
  server.on("request", app);
  server.listen(options.port, (err: Error) => {
    if (err) {
      throw err;
    }
    log("服务器已启动");

    if (options.openOnBrowser) {
      const url = `http://${ options.host === "0.0.0.0" ? "127.0.0.1" : options.host }:${ options.port }`;
      log("在浏览器打开 %s", url);
      open(url);
    }
  });

  // 监听全局错误
  process.on("uncaughtException", (err: Error) => {
    log("uncaughtException: %s", colors.red(err.stack || ""));
  });
  process.on("unhandledRejection", (err: Error) => {
    log("unhandledRejection: %s", colors.red(err.stack || ""));
  });
}
