/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as fs from "fs";
import * as path from "path";
import less = require("less");
import * as browserify from "browserify";
import mkdirp = require("mkdirp");

// 回调函数
export type ResultCallback = (err: Error | null | undefined, data?: Buffer | String | null) => void;

// 打包js文件
function bundleJSFile(file: string, callback: ResultCallback): void {
  fs.exists(file, ok => {
    if (!ok) {
      return callback(new Error(`文件 ${ file } 不存在`));
    }
    const b = browserify();
    b.add(file).bundle(callback);
  });
}

// 打包less文件
function bundleLessFile(file: string, callback: ResultCallback): void {
  fs.readFile(file, (err, buf) => {
    if (err) {
      return callback(err);
    }
    less.render(buf.toString(), {
      filename: file,
      plugins: [],
    }, (err2: Less.RenderError, ret: Less.RenderOutput) => {
      if (err2) {
        const msg = `
${ err2.type } Error: ${ err2.message }
  at ${ err2.filename }:${ err2.line }:${ err2.column }
${ err2.extract.join("\n") }
        `.trim();
        return callback(new Error(msg));
      }
      callback(null, ret.css);
    });
  });
}

// 大包文件
export function bundle(file: string, callback: ResultCallback): void {
  if (file.slice(-3) === ".js") {
    return bundleJSFile(file, callback);
  }
  if (file.slice(-5) === ".less") {
    return bundleLessFile(file, callback);
  }
  callback(null, null);
}

// 打包文件并保存
export function bundleFile(file: string, outFile: string, callback: ResultCallback): void {
  bundle(file, (err: Error, data: Buffer | string) => {
    if (err) {
      return callback(err);
    }
    mkdirp(path.dirname(outFile), (err2: Error) => {
      if (err2) {
        return callback(err2);
      }
      fs.writeFile(outFile, data, (err3: Error) => {
        callback(err3, data);
      });
    });
  });
}
