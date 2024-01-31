import initSourceClient from "./ReactSourceGetter/Background";
import { create, backgroundClient, ChromeMessage, get } from "../chrome";
import { shortKeyKey } from "../const";
import { configManager } from '../pub/ConfigManager'
class Background {
  constructor() {
    this.init();
  }

  init() {
    this.initContentMenu();
    this.initMessageClient();

    this.initJumpSourceClient();

    // 屏蔽 Receiving end does not exist 错误。
    chrome.runtime.onConnect.addListener(() => { });
  }

  //初始化cmd+鼠标跳转功能
  initJumpSourceClient() {
    chrome.tabs.onUpdated.addListener(async (tabId, b, tabs) => {
      // let keys = await get(shortKeyKey);
      // keys = keys?.length ? keys : ["metaKey"];
      await configManager.initConfigs();
      chrome.scripting.executeScript({
        target: {
          tabId,
        },
        world: "MAIN",
        func: initSourceClient,
        args: [configManager.configs],
      });
    });
  }

  // 初始化右键菜单;
  initContentMenu() {
    // create({
    //   id: "demo",
    //   title: "APM DevTool",
    //   onclick: () => {
    //     backgroundClient.seedMessage(new ChromeMessage("show modal"));
    //   },
    // });
  }

  // 初始化消息通道
  initMessageClient() {
    backgroundClient.listen("test connect", (data, sendResponse) => {
      sendResponse(new ChromeMessage("Connecting!"));
    });
    backgroundClient.listen("configChange", (data, sendResponse) => {
      // this.changeJumpSourceClient(data.params);
      sendResponse(new ChromeMessage("Change success!"));
    });
  }
}

let bgclient = new Background();
