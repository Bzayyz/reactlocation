import { configManager } from "./Locator/ConfigManager";
import { eventBridge } from "./Locator/EventBridge";
import { ReactSourceGetter } from "./Locator/ReactSourceGetter";
import { render } from "react-dom";
import { LocatorView } from "./Locator/LocatorView";

export class Content {
  constructor() {
    console.log("react start1");

    document.addEventListener("DOMContentLoaded", () => {
      new ReactSourceGetter(eventBridge, configManager.configs);
      const { document } = window;
      const base = document.querySelector(
        "#chrome-extension-content-base-elemen"
      );
      let container = null;
      if (base) {
        container = base;
      } else {
        container = document.createElement("div");
        container.setAttribute("id", "chrome-extension-content-base-element");
        //@ts-ignore
        container.setAttribute("class", WRAPPER_CLASS_NAME);
      }
      document.body.appendChild(container);
      render(
        <LocatorView eb={eventBridge} configs={configManager.configs} />,
        container
      );
    });
  }
}
