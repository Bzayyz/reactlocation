import { configManager } from "../pub/ConfigManager";
import { render } from "react-dom";
import { LocatorView } from "./Locator/LocatorView";
import { eventBridge } from "../pub/EventBridge";

export class Content {
  constructor() {
    document.addEventListener("DOMContentLoaded", async () => {
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
      await configManager.initConfigs();
      render(
        <LocatorView eb={eventBridge} configs={configManager.configs} />,
        container
      );
    });
  }
}
