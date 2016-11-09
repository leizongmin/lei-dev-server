# lei-dev-server
简单的前端开发服务器

## 安装

```bash
$ npm install lei-dev-server -g
```


## 使用方法

```
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
```

首先新建文件`index.html`：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <h1>hello, world! <small>by 老雷</small></h1>
    <hr>
    <p>今天的天气真好，万里<strong>无云</strong>。</p>
    <p>今天的天气真好，万里<strong>无云</strong>。</p>
    <p>今天的天气真好，万里<strong>无云</strong>。</p>
  </body>
</html>
```

新建文件`style.css`：

```css
body {
  background: #f8f8f8;
  color: #555555;
  width: 80%;
  margin: 100px auto 50px auto;
}
h1 {
  text-align: center;
  color: blueviolet;
}
small {
  font-size: 40%;
}
p {
  margin: 2em 0;
  font-size: 18px;
  border: 1px solid deepskyblue;
  padding: 4px;
  cursor: pointer;
}
p:hover {
  background: yellowgreen;
}
```

新建文件`index.js`：

```javascript
console.log('hello, world');
```

在当前项目根目录下执行以下命令：

```bash
$ devserver -w -o -p 8000
```

稍等几秒，服务器启动后会自动在浏览器打开地址`http://127.0.0.1:8000`即可看到显示的页面。

说明：

+ 如果启动服务器时使用了`-w`参数，则当目录下的任意文件有改动时，在浏览器中打开的HTML会自动刷新
+ 在 JavaScript 文件内，可以使用`require()`来载入模块，实际上会通过 Browserify 来进行打包


## License

```
MIT License

Copyright (c) 2016 Zongmin Lei <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
