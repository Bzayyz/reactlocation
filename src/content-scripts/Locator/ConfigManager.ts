import { BuildTool, Editor, HotKey, type LocatorConfigs } from './types';

const STORAGE_KEY = 'xixikf_react_locator_config_key';

const configKeys = ['buildTool', 'editor', 'hotKeys', 'customPath'];

class ConfigManager {
  private _configs: LocatorConfigs;
  constructor(defaultConfigs: LocatorConfigs) {
    try {
      const storedConfigs = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
      this._configs = { ...defaultConfigs, ...storedConfigs };
    } catch (e) {
      this._configs = defaultConfigs;
    }
  }
  get configs() {
    return this._configs;
  }

  setConfigs(configs: Partial<LocatorConfigs>) {
    configKeys.forEach((key) => {
      //@ts-ignore-next-line
      this._configs[key] = configs[key];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._configs));
  }
}

const defaultConfigs: LocatorConfigs = {
  buildTool: BuildTool.webpack,
  editor: Editor.vscode,
  hotKeys: [HotKey.metaKey],
};
export const configManager = new ConfigManager(defaultConfigs);
