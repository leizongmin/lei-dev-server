#!/usr/bin/env node

/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import path = require('path');
import yargs = require('yargs');

// 包信息
const pkgInfo = require('../package.json');

// 版本信息
const versionInfo = `devserver v${ pkgInfo.version }`;

// 使用方法
function printUsage() {
  console.log(`
----------------------------------------
${ versionInfo }

启动服务器：

  $ devserver [dir] [options]
    dir       项目根目录
    options   选项

选项：
    -w, --watch-dir=./lib   监听指定目录下文件的变动，并自动刷新页面，默认关闭
    -p, --port=3000         服务器监听端口，默认3000
    -h, --host=127.0.0.1    服务器监听地址，默认127.0.0.1
    -o, --open              启动后在浏览器打开首页

显示版本号：     $ devserver --version
显示此帮助信息：  $ devserver --help
----------------------------------------
  `.trim());
}

// 显示版本号
function printVersion() {
  console.log(versionInfo);
  process.exit();
}

const argv = yargs.argv;

if (argv.help) {
  printUsage();
  process.exit();
}
if (argv.version) {
  printVersion();
}

// 项目根目录
const dir = path.resolve(argv._[0] || '.');
// 监听指定目录
let watchDir = argv.w || argv.watchDir;
if (watchDir === true) {
  watchDir = dir;
}
// 服务器监听端口
const port = Number(argv.p || argv.port || 3000);
// 服务器监听地址
const host = argv.h || argv.host || '127.0.0.1';
// 是否在浏览器打开
const openOnBrowser = argv.o || argv.open || false;

console.log(`
项目根目录：${ dir }
监听根目录：${ watchDir || '无' }
服务器地址：http://${ host }:${ port }
`.trim());

require('./server')({ dir, watchDir, host, port, openOnBrowser });
