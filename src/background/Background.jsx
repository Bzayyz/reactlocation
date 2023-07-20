import { create, backgroundClient, ChromeMessage, get } from "../chrome";
import { openComponentInEditor } from "./utils";
import { shortKeyKey } from "../const";

export default class Background {
  constructor() {
    this.init();
  }

  init() {
    this.initContentMenu();
    this.initMessageClient();
    this.initJumpSourceClient();

    // 屏蔽 Receiving end does not exist 错误。
    chrome.runtime.onConnect.addListener(() => {});
  }

  //初始化option+左键跳转vscode功能
  initJumpSourceClient() {
    chrome.tabs.onUpdated.addListener(async (tabId, b, tabs) => {
      let keys = await get(shortKeyKey);
      keys = keys?.length ? keys : ["metaKey"];
      chrome.scripting.executeScript({
        target: {
          tabId,
        },
        world: "MAIN",
        func: openComponentInEditor,
        args: [tabId, keys],
      });
    });
  }

  // changeJumpSourceClient(curKeys) {
  //   console.log(curKeys);
  //   get(shortKeyKey).then((keys) => {
  //     chrome.tabs.query({}, (tabs) => {
  //       tabs.forEach(({ tabId }) => {
  //         chrome.scripting.executeScript(
  //           {
  //             target: {
  //               tabId,
  //             },
  //             world: "MAIN",
  //             func: openComponentInEditor,
  //             args: [tabId, keys],
  //           },
  //           () => void chrome.runtime.lastError
  //         );
  //       });
  //     });
  //   });
  // }

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
    backgroundClient.listen("shortkey changed", (data, sendResponse) => {
      // this.changeJumpSourceClient(data.params);
      sendResponse(new ChromeMessage("Change success!"));
    });
    backgroundClient.listen("content_init", (data, sendResponse) => {});
  }
}
