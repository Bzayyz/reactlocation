import { get, set } from "../chrome";
import { ConfigEventBridge, configEventBridge } from "./EventBridge";
import { BuildTool, Editor, HotKey, type LocatorConfigs } from "./types";

const configKeys = ["buildTool", "editor", "hotKeys", "customPath"];

class ConfigManager {
  _configs: LocatorConfigs;
  eb: ConfigEventBridge;
  defaultConfigs: LocatorConfigs;

  constructor(defaultConfigs: LocatorConfigs, eb: ConfigEventBridge) {
    this.eb = eb;
    this.initListener();
    this.defaultConfigs = defaultConfigs;
  }

  get configs() {
    return this._configs;
  }

  async initConfigs() {
    try {
      const storedConfigs = JSON.parse((await get(STORAGE_KEY)) as string);
      this._configs = { ...this.defaultConfigs, ...storedConfigs };
    } catch (e) {
      this._configs = this.defaultConfigs;
    }
    this.eb.send(this._configs);
  }

  initListener() {
    this.eb.onMessage((configs: Partial<LocatorConfigs>) => {
      this._setConfigs(configs);
    });
  }
  private _setConfigs(configs: Partial<LocatorConfigs>) {
    configKeys.forEach((key) => {
      //@ts-ignore-next-line
      this._configs[key] = configs[key];
    });
    set(STORAGE_KEY, JSON.stringify(this._configs));
  }

  setConfigs(configs: Partial<LocatorConfigs>) {
    this._setConfigs(configs);
    this.eb.send(this._configs);
  }
}

const STORAGE_KEY = "react_locator_config_key";

const defaultConfigs: LocatorConfigs = {
  buildTool: BuildTool.webpack,
  editor: Editor.vscode,
  hotKeys: [HotKey.metaKey],
};
export const configManager = new ConfigManager(
  defaultConfigs,
  configEventBridge
);
