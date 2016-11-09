#!/usr/bin/env node
"use strict";
var path = require('path');
var yargs = require('yargs');
// 使用方法
function printUsage() {
    console.log("\n----------------------------------------\n\u4F7F\u7528\u65B9\u6CD5\uFF1A\n\n  $ devserver [options] [dir]\n    dir       \u9879\u76EE\u6839\u76EE\u5F55\n    options   \u9009\u9879\n\n\u9009\u9879\uFF1A\n    -w, --watch-dir=./lib   \u76D1\u542C\u6307\u5B9A\u76EE\u5F55\u4E0B\u6587\u4EF6\u7684\u53D8\u52A8\uFF0C\u5E76\u81EA\u52A8\u5237\u65B0\u9875\u9762\uFF0C\u9ED8\u8BA4\u65E0\n    -p, --port=3000         \u670D\u52A1\u5668\u76D1\u542C\u7AEF\u53E3\uFF0C\u9ED8\u8BA43000\n    -h, --host=127.0.0.1    \u670D\u52A1\u5668\u76D1\u542C\u5730\u5740\uFF0C\u9ED8\u8BA4127.0.0.1\n----------------------------------------\n  ".trim());
}
var argv = yargs.argv;
if (argv.help) {
    printUsage();
    process.exit();
}
// 项目根目录
var dir = path.resolve(argv._[0] || '.');
// 监听指定目录
var watchDir = argv.w || argv.watchDir;
// 服务器监听端口
var port = Number(argv.p || argv.port || 3000);
// 服务器监听地址
var host = argv.h || argv.host || '127.0.0.1';
console.log(("\n\u9879\u76EE\u6839\u76EE\u5F55\uFF1A" + dir + "\n\u76D1\u542C\u6839\u76EE\u5F55\uFF1A" + (watchDir || '无') + "\n\u670D\u52A1\u5668\u5730\u5740\uFF1Ahttp://" + host + ":" + port + "\n").trim());
require('./server')({ dir: dir, watchDir: watchDir, host: host, port: port });
//# sourceMappingURL=cli.js.map