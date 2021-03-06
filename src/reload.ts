/**
 * Dev-Server
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

let ws: WebSocket;
let tid: NodeJS.Timer | null;
const delay = 5;

function connect() {

  if (tid) {
    clearTimeout(tid);
  }
  tid = null;
  console.log("尝试连接到服务器");

  ws = new WebSocket(`ws://${ location.host }`);

  ws.addEventListener("open", () => {
    console.log("已连接到服务器");
  });

  ws.addEventListener("message", (msg: MessageEvent) => {
    console.log("接收到服务器数据", msg.data);
    if (/^fileChanged:.*/.test(msg.data)) {
      console.log("自动刷新页面");
      location.reload();
    }
  });

  ws.addEventListener("close", () => {
    console.log("服务器已关闭连接，%s秒后自动重新连接", delay);
    tid = setTimeout(() => {
      connect();
    }, delay * 1000);
  });
}

connect();
