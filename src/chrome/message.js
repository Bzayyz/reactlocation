/* eslint-disable no-undef */
// 统一消息格式
class ChromeMessage {
  constructor(msg, params) {
    this.msg = msg;
    this.params = params;
  }
}
// 获取函数的形参个数
function getFuncParameters(func) {
  if (typeof func === "function") {
    const match = /[^(]+\(([^)]*)?\)/gm.exec(
      Function.prototype.toString.call(func)
    );
    if (match[1]) {
      const args = match[1].replace(/[^,\w]*/g, "").split(",");
      return args.length;
    }
  }

  return 0;
}

// 事件分发
function dispatchEvent(listeners, request, sendResponse) {
  const { msg } = request;
  let callBack;
  Object.keys(listeners).forEach((key) => {
    if (key === msg) {
      callBack = listeners[key];
    }
  });
  callBack?.(request, sendResponse);
}

// content scripts 发送和监听消息
class ContentClient {
  listeners = {};
  constructor() {
    this.startListen();
  }
  listen(msg, callBack) {
    this.listeners[msg] = callBack;
  }

  startListen() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

      dispatchEvent(this.listeners, request, sendResponse);
      return true;
    });
  }

  seedMessage(message) {

    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (res) => {
        resolve(res);
      });
    });
  }
}

// background 发送和监听消息
class BackgroundClient {
  listeners = {};
  constructor() {
    this.startListen();
  }
  listen(msg, callBack) {
    this.listeners[msg] = callBack;
  }

  startListen() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const success = dispatchEvent(this.listeners, request, sendResponse);
      if (!success) {
        sendResponse(
          new ChromeMessage(
            "log",
            "Default Response,backgroud.js may occur some errors"
          )
        );
      }
      return true;
    });
  }

  seedMessage(message) {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs?.length &&
          chrome.tabs.sendMessage(tabs[0]?.id, message, (response) => {
            resolve(response);
          });
      });
    });
  }
}

const contentClient = new ContentClient();
const backgroundClient = new BackgroundClient();

export { contentClient, backgroundClient, ChromeMessage };
