#!/usr/bin/env node

/**
 * Dev-Server
 * 
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import path = require('path');
import yargs = require('yargs');

// 使用方法
function printUsage() {
  console.log(`
----------------------------------------
使用方法：

  $ devserver [dir] [options]
    dir       项目根目录
    options   选项

选项：
    -w, --watch-dir=./lib   监听指定目录下文件的变动，并自动刷新页面，默认无
    -p, --port=3000         服务器监听端口，默认3000
    -h, --host=127.0.0.1    服务器监听地址，默认127.0.0.1
----------------------------------------
  `.trim());
}

const argv = yargs.argv;

if (argv.help) {
  printUsage();
  process.exit();
}

// 项目根目录
const dir = path.resolve(argv._[0] || '.');
// 监听指定目录
let watchDir = argv.w || argv.watchDir;
if (watchDir === true) watchDir = dir;
// 服务器监听端口
const port = Number(argv.p || argv.port || 3000);
// 服务器监听地址
const host = argv.h || argv.host || '127.0.0.1';

console.log(`
项目根目录：${ dir }
监听根目录：${ watchDir || '无' }
服务器地址：http://${ host }:${ port }
`.trim());

require('./server')({ dir, watchDir, host, port });
