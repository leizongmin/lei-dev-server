/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */
"use strict";
var fs = require('fs');
var path = require('path');
var util = require('util');
var browserify = require('browserify');
var express = require('express');
var colors = require('colors');
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    console.log('%s - %s', new Date().toLocaleTimeString(), colors.green(util.format.apply(util, [args[0]].concat(args.slice(1)))));
}
module.exports = function (options) {
    var app = express();
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
        res.setHeader('content-type', 'text/javascript');
        res.end("alert('ok')");
    });
    // js文件
    app.use(function (req, res, next) {
        if (req.filename.slice(-3) !== '.js')
            return next();
        fs.exists(req.filename, function (ok) {
            if (!ok)
                return next();
            var b = browserify();
            b.add(req.filename).bundle(function (err, buf) {
                if (err)
                    return next(err);
                log('打包文件 %s', req.filename);
                res.end(buf);
            });
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
                res.write("<script type=\"text/javascript\" src=\"/-/reload.js\"></script>");
            }
            res.end();
        });
    });
    // 其它所有文件
    app.use(express.static(options.dir));
    // 监听端口
    app.listen(options.port, function (err) {
        if (err)
            throw err;
        // open(`http://${ options.host }:${ options.port }/index.html`);
        log('服务器已启动');
    });
};
//# sourceMappingURL=server.js.map