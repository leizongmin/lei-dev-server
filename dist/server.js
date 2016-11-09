/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */
"use strict";
var fs = require('fs');
var path = require('path');
var http = require('http');
var util = require('util');
var browserify = require('browserify');
var express = require('express');
var WebSocket = require('ws');
var colors = require('colors');
var watch = require('watch');
// 打印日志
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    console.log('%s - %s', new Date().toLocaleTimeString(), colors.green(util.format.apply(util, [args[0]].concat(args.slice(1)))));
}
// 打包日志文件
function bundleFile(file, callback) {
    fs.exists(file, function (ok) {
        if (!ok)
            return callback(new Error("\u6587\u4EF6 " + file + " \u4E0D\u5B58\u5728"));
        log('打包文件 %s', file);
        var s = process.uptime();
        var b = browserify();
        b.add(file).bundle(function (err, buf) {
            if (err) {
                log('打包文件 %s 出错：%s', file, colors.yellow(err.stack));
                return callback(err);
            }
            log('打包文件 %s 完成，耗时 %s 秒', file, (process.uptime() - s).toFixed(3));
            callback(null, buf);
        });
    });
}
module.exports = function (options) {
    var server = http.createServer();
    var wss = new WebSocket.Server({ server: server });
    var app = express();
    // 广播消息给所有客户端
    function broadcast(data) {
        wss.clients.forEach(function (client) {
            client.send(data);
        });
    }
    // 监听文件变化
    if (options.watchDir) {
        watch.watchTree(options.watchDir, {
            ignoreDotFiles: true,
            interval: 1
        }, function (file) {
            if (typeof file === 'string') {
                log('文件改变 %s', file);
                broadcast("fileChanged:" + file);
            }
        });
    }
    // 根据请求生成绝对文件名
    app.use(function (req, res, next) {
        var i = req.url.indexOf('?');
        if (i === -1) {
            req.pathname = req.url;
        }
        else {
            req.pathname = req.url.slice(0, i);
        }
        if (req.pathname === '/')
            req.pathname = '/index.html';
        req.filename = path.resolve(options.dir, req.pathname.slice(1));
        log('%s %s', req.method, req.url);
        next();
    });
    // reload.js
    app.use('/-/reload.js', function (req, res, next) {
        bundleFile(path.resolve(__dirname, 'reload.js'), function (err, buf) {
            res.setHeader('content-type', 'text/javascript');
            res.end(buf);
        });
    });
    // js文件
    app.use(function (req, res, next) {
        if (req.filename.slice(-3) !== '.js')
            return next();
        bundleFile(req.filename, function (err, buf) {
            if (err)
                return next(err);
            res.setHeader('content-type', 'text/javascript');
            res.end(buf);
        });
    });
    // html文件
    app.use(function (req, res, next) {
        if (req.filename.slice(-5) !== '.html')
            return next();
        fs.readFile(req.filename, function (err, buf) {
            if (err)
                return next(err);
            // 响应页面
            res.setHeader('content-type', 'text/html');
            res.write(buf);
            // 插入自动刷新页面的脚本
            if (options.watchDir) {
                res.write("\n<!-- \u6587\u4EF6\u4FEE\u6539\u540E\u81EA\u52A8\u5237\u65B0\u9875\u9762 -->\n<script type=\"text/javascript\" src=\"/-/reload.js\"></script>\n        ");
            }
            res.end();
        });
    });
    // 其它所有文件
    app.use(express.static(options.dir));
    // 文件不存在
    app.use(function (req, res, next) {
        res.statusCode = 404;
        res.setHeader('content-type', 'text/html');
        res.end("<h1>\u6587\u4EF6 " + req.filename + " \u4E0D\u5B58\u5728</h1>");
    });
    // 出错
    app.use(function (err, req, res, next) {
        res.statusCode = 500;
        res.end(err.stack);
    });
    // 监听端口
    server.on('request', app);
    server.listen(options.port, function (err) {
        if (err)
            throw err;
        // open(`http://${ options.host }:${ options.port }/index.html`);
        log('服务器已启动');
    });
    // 监听全局错误
    process.on('uncaughtException', function (err) {
        log('uncaughtException: %s', colors.red(err.stack));
    });
    process.on('unhandledRejection', function (err) {
        log('unhandledRejection: %s', colors.red(err.stack));
    });
};
//# sourceMappingURL=server.js.map