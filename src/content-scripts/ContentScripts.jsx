import React from "react";
import { render } from "react-dom";
import { ChromeMessage, contentClient, get } from "../chrome";
import "./ContentScripts.scss";
import PathList from "./PathList";
import SwitchModal from "./SwitchModal";
import { getJumpUrl } from "./util";
import { FocusSvg } from "./PathList/SvgComponent";

export default class ContentScripts {
  constructor() {
    this.container = null;
    this.editor = "";
    this.buildTool = "";
    this.customPath = "";
    this.elemClickListenner = null;
    this.rightClickContainer = null;
    this.getJumpUrl = undefined;
    this.svgContainer = null;
    this.rightClickContainerListener = null;
    this.init();
  }

  init() {
    // 注意，必须设置了run_at=document_start 此段代码才会生效
    document.addEventListener("DOMContentLoaded", () => {
      this.initContainer();
      this.initRightClickContainer();

      this.initMessageClient();
      this.getJumpUrl = getJumpUrl.bind(this);
      Promise.all([get("editor"), get("buildTool"), get("customPath")]).then(
        ([editor, buildTool, customPath]) => {
          console.log();
          this.editor = editor;
          this.buildTool = buildTool;
          this.customPath = customPath;
        }
      );
      this.initClickListener();
      this.injectScript(chrome.runtime.getURL("js/inject.js"), "body");
    });
  }

  initClickListener() {
    this.elemClickListenner = window.addEventListener(
      "message",
      (message) => {
        const type = message?.data?.type;
        if (type === "singleNodePath") {
          const elemPath = message?.data?.data;
          if (!elemPath) return;
          this.jumpToEditor(elemPath);
        } else if (type === "allPath") {
          const { data: pathArr, position } = message?.data;
          this.showRightContainer(position);
          render(
            <PathList
              position={position}
              pathList={pathArr}
              editor={this.editor}
              buildTool={this.buildTool}
              jumpToEditor={this.jumpToEditor.bind(this)}
              close={this.hideRightContainer.bind(this)}
            />,
            this.rightClickContainer
          );
          render(<FocusSvg />, this.svgContainer);
        }
      },
      false
    );
  }
  // 初始化消息通道
  initMessageClient() {
    const { container } = this;
    contentClient.seedMessage(
      new ChromeMessage("content_init", { title: window.document.title })
    );
    contentClient.listen("test init connect", (res, sendResponse) => {});
    contentClient.listen("show modal", () => {
      this.showContainer();
      render(
        <SwitchModal
          onClose={() => {
            this.hideContainer();
          }}
        />,
        container
      );
    });

    //popup中改变了editor时
    contentClient.listen("editor changed", (data, sendResponse) => {
      this.editor = data.params;
      // window.removeEventListener("message", this.elemClickListenner);
      // this.elemClickListenner = window.addEventListener(
      //   "message",
      //   (message) => {
      //     const type = message?.data?.type;
      //     if (type === "singleNodePath") {
      //       const elemPath = message?.data?.data;
      //       if (!elemPath) return;

      //       const iframe = document.createElement("iframe");
      //       iframe.style.display = "none";
      //       iframe.src = url;
      //       document.body.appendChild(iframe);
      //       setTimeout(() => {
      //         iframe.remove();
      //       }, 100);
      //     } else if (type === "allParentPath") {
      //       const { data: pathArr, position } = message?.data;
      //       console.log(position);
      //       render(<PathList pathList={pathArr} editor={this.editor} />);
      //     }
      //   },
      //   false
      // );
      sendResponse(new ChromeMessage("Editor changed successfully"));
    });

    contentClient.listen("buildTool changed", (data, sendResponse) => {
      this.buildTool = data.params;
      sendResponse(new ChromeMessage("Editor changed successfully"));
    });

    contentClient.listen("customPath changed", (data, sendResponse) => {
      this.customPath = data.params;
      sendResponse(new ChromeMessage("customPath changed successfully"));
    });
  }

  jumpToEditor(elemPath) {
    let url = this.getJumpUrl(elemPath);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => {
      iframe.remove();
    }, 100);
  }

  injectScript(file_path) {
    var script = document.createElement("script");
    script.id = "package_installer";
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", file_path);
    document.documentElement.appendChild(script);
    document.documentElement.removeChild(script);
  }
  // 初始化外层包裹元素
  initContainer() {
    const { document } = window;
    const base = document.querySelector(
      "#chrome-extension-content-base-elemen"
    );
    if (base) {
      this.container = base;
    } else {
      this.container = document.createElement("div");
      this.container.setAttribute(
        "id",
        "chrome-extension-content-base-element"
      );
      this.container.setAttribute("class", WRAPPER_CLASS_NAME);
      document.body.appendChild(this.container);
    }
    this.container.setAttribute("style", "display: none");
  }
  initRightClickContainer() {
    this.rightClickContainer = window.document.createElement("div");
    this.svgContainer = window.document.createElement("div");
    this.svgContainer.minHeight = "20px";
    this.rightClickContainer.style.position = "fixed";
    this.svgContainer.style.position = "fixed";
    this.rightClickContainer.style.zIndex = 99999;
    this.svgContainer.style.zIndex = 99999;
    this.rightClickContainer.style.transition = "all 0.5s";
    document.body.appendChild(this.rightClickContainer);
    document.body.appendChild(this.svgContainer);
  }

  showRightContainer(position) {
    this.svgContainer.style.display = "block";
    this.rightClickContainer.style.display = "block";
    // this.rightClickContainer.style.visibility = "visible";
    this.rightClickContainer.style.opacity = 1;
    this.svgContainer.style.left = position.pageX - 10 + "px";
    this.svgContainer.style.top = position.pageY - 10 + "px";
    if (position.pageX + 450 > window.innerWidth) {
      this.rightClickContainer.style.left =
        position.pageX + 180 > window.innerWidth
          ? position.pageX - 430 + "px"
          : position.pageX - 330 + "px";
    } else this.rightClickContainer.style.left = position.pageX + 10 + "px";
    if (position.pageY + 300 > window.innerHeight) {
      this.rightClickContainer.style.top = position.pageY - 320 + "px";
    } else this.rightClickContainer.style.top = position.pageY + 10 + "px";
    this.rightClickContainerListener = window.addEventListener("click", (e) => {
      if (e.target !== this.rightClickContainer) {
        this.hideRightContainer();
      }
    });
  }

  hideRightContainer() {
    this.svgContainer.style.display = "none";
    this.rightClickContainer.style.display = "none";
    // this.rightClickContainer.style.visibility = "hidden";
    this.rightClickContainer.style.opacity = 0;
    window.removeEventListener("click", this.rightClickContainerListener);
  }

  showContainer() {
    this.container.style.visibility = "block";
    this.container.style.opacity = 1;
  }

  hideContainer() {
    this.container.setAttribute("style", "display: none");
  }
}
