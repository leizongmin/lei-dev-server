#!/usr/bin/env node

/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import path = require('path');
import yargs = require('yargs');
import colors = require('colors');
import { bundleFile } from './bundle';

// 包信息
const pkgInfo = require('../package.json');

// 版本信息
const versionInfo = `devserver v${ pkgInfo.version }`;

// 使用方法
function printUsage() {
  console.log(`
----------------------------------------
${ versionInfo }

启动服务器:

  $ devserver [command] [options]

启动Web服务:     $ devserver start
选项:
    -d, --dir=./            指定根目录
    -w, --watch-dir=./lib   监听指定目录下文件的变动，并自动刷新页面，默认关闭
    -p, --port=3000         服务器监听端口，默认3000
    -h, --host=127.0.0.1    服务器监听地址，默认127.0.0.1
    -o, --open              启动后在浏览器打开首页

打包文件:        $ devserver bundle <input_file> <output_file>
显示版本号:      $ devserver version
显示此帮助信息:  $ devserver help
----------------------------------------
  `.trim());
}

// 显示版本号
function printVersion() {
  console.log(versionInfo);
}

// 打印出错信息并退出
function die(msg?: string, code?: number): void {
  if (msg) {
    console.log(colors.red(msg));
  }
  process.exit(code);
}

const argv = yargs.argv;

// 命令
const command = argv._[0] || '';
if (command === 'help') {

  printUsage();
  process.exit();

} else if (command === 'version') {

  printVersion();
  process.exit();

} if (command === 'start') {

  // 项目根目录
  const dir = path.resolve(argv.d || argv.dir || '.');
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
项目根目录: ${ dir }
监听根目录: ${ watchDir || '无' }
服务器地址: http://${ host }:${ port }
  `.trim());

  require('./server')({ dir, watchDir, host, port, openOnBrowser });

} else if (command === 'bundle') {

  let inFile = argv._[1];
  let outFile = argv._[2];
  if (!inFile) {
    die(`请提供输入文件!`);
  }
  if (!outFile) {
    die(`请提供输出文件!`);
  }
  inFile = path.resolve(inFile);
  outFile = path.resolve(outFile);
  console.log(`
输入文件: ${ inFile }
输出文件: ${ outFile }
  `.trim());
  bundleFile(inFile, outFile, (err: Error, data: string | Buffer) => {
    if (err) {
      die(err.stack);
    }
    console.log('OK');
    process.exit();
  });

} else {

  console.log(colors.red(`无法识别的命令"${ command }"`));
  printUsage();
  process.exit();

}
