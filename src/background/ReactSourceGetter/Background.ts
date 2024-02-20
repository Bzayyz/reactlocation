import "./index.less";

//关于数据源：本地是被react放在reactFiberNode的_debugSource中，这个不安装babel插件也会有的。
//远程的话是接了babel插件的话，是放在reactFiberNode.pendingProps.[DATA_TAG]里的，是自己塞进去的

export default function initSourceClient(config) {
  console.info("当前react跳转配置为", config);
  const enum RCMessageType {
    "SINGLE" = "single",
    "MULTI" = "multi",
  }
  type PathSources = Record<TabKey, SourceType[]>;

  type RcMessageType2DataType = {
    [RCMessageType.SINGLE]: {
      sourceData: SourceType | null;
      bundle?: string;
      firstHasSourceBundle?: string;
    };
    [RCMessageType.MULTI]: {
      sourceData: PathSources;
      position: { x: number; y: number };
      bundle?: string;
      firstHasSourceBundle?: string;
    };
  };

  type RCMessageData<T extends RCMessageType> = RcMessageType2DataType[T];

  class RCMessage<T extends RCMessageType> {
    type: RCMessageType;
    data: RCMessageData<T>;
    constructor(type: T, data: RCMessageData<T>) {
      this.type = type;
      this.data = data;
    }
  }
  interface LocatorConfigs {
    buildTool: BuildTool;
    editor: Editor;
    hotKeys: Array<HotKey>;
    customPath?: string;
  }
  type FileSource = {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
    remotePrefix?: string;
  };
  type SourceType = {
    source: FileSource;
    ComponentName: string;
    bundle?: string;
    isRemote?: boolean;
  };
  const DATA_TAG = "data-debug-source";

  const enum TabKey {
    ancestors = "ancestors",
    descendants = "descendants",
  }

  const enum BuildTool {
    webpack = "webpack",
    vite = "vite",
    rspack = "rspack",
    other = "other",
  }

  const enum Editor {
    vscode = "vscode",
    webstorm = "webstorm",
  }

  const enum HotKey {
    metaKey = "metaKey",
    altKey = "altKey",
    shiftKey = "shiftKey",
    ctrlKey = "ctrlKey",
  }
  class ReactSourceGetter {
    private configs: LocatorConfigs;
    private eb: EventBridge;
    private _firstHasSourceBundle: string;
    private _leftClickHandler: (e: any) => void;
    private _rightClickHandler: (e: any) => void;
    constructor(eb: EventBridge, configs: LocatorConfigs) {
      this.configs = configs;
      this._firstHasSourceBundle = "";
      this._leftClickHandler = this.leftClickHandler.bind(this);
      this._rightClickHandler = this.rightClickHandler.bind(this);
      this.addListeners();
      this.eb = eb;
    }
    addListeners() {
      window.addEventListener("click", this._leftClickHandler);
      window.addEventListener("contextmenu", this._rightClickHandler);
    }

    removeListeners() {
      window.removeEventListener("click", this._leftClickHandler);
      window.removeEventListener("contextmenu", this._rightClickHandler);
    }

    setFirstHasSourceBundle(element: HTMLElement) {
      if (!this._firstHasSourceBundle) {
        this._firstHasSourceBundle = getMaybeBundle(element);
      }
    }

    getFallbackDebugSourceFromElement(element: any): SourceType | null {
      const parentElement = element.parentElement;
      if (element.tagName === "HTML" || parentElement === null) {
        return null;
      }
      let fiberNodeInstance;

      for (const key in element) {
        if (
          key.startsWith("__reactInternalInstance") ||
          key.startsWith("__reactFiber$")
        ) {
          fiberNodeInstance = element[key];
        }
      }
      const {
        _debugSource: debugSource,
        elementType,
        pendingProps,
      } = fiberNodeInstance ?? {};

      if (debugSource) {
        this.setFirstHasSourceBundle(element as HTMLElement);
        return {
          source: debugSource,
          ComponentName: getElementTypeDisplayName(
            elementType,
            debugSource?.componentName
          ),
        };
      } else if (pendingProps?.[DATA_TAG]) {
        this.setFirstHasSourceBundle(element as HTMLElement);
        return getSourceFromProps(pendingProps);
      }

      return this.getFallbackDebugSourceFromElement(parentElement);
    }

    getFallbackDebugSource(
      fiberNodeInstance: any,
      element: HTMLElement
    ): SourceType | null {
      if (fiberNodeInstance?._debugOwner) {
        if (fiberNodeInstance._debugOwner._debugSource) {
          return {
            source: fiberNodeInstance._debugOwner._debugSource,
            ComponentName: getElementTypeDisplayName(
              fiberNodeInstance._debugOwner?.elementType,
              fiberNodeInstance._debugOwner._debugSource?.componentName
            ),
          };
        } else if (fiberNodeInstance._debugOwner?.pendingProps?.[DATA_TAG]) {
          return getSourceFromProps(
            fiberNodeInstance._debugOwner?.pendingProps
          );
        }
        return this.getFallbackDebugSource(
          fiberNodeInstance._debugOwner,
          element
        );
      } else {
        return this.getFallbackDebugSourceFromElement(element);
      }
    }
    pushAllFallbackDebugSource(
      fiberNodeInstance: any,
      resArr: SourceType[] = []
    ) {
      if (fiberNodeInstance?._debugOwner) {
        if (fiberNodeInstance._debugOwner._debugSource) {
          resArr.push({
            source: fiberNodeInstance._debugOwner._debugSource,
            ComponentName: getElementTypeDisplayName(
              fiberNodeInstance._debugOwner?.elementType,
              fiberNodeInstance._debugOwner._debugSource?.componentName
            ),
          });
        } else if (fiberNodeInstance._debugOwner?.pendingProps?.[DATA_TAG]) {
          resArr.push(
            getSourceFromProps(fiberNodeInstance._debugOwner?.pendingProps)
          );
        }
        this.pushAllFallbackDebugSource(fiberNodeInstance._debugOwner, resArr);
      }
    }

    getElemPath(element: HTMLElement): SourceType | null {
      let fiberNodeInstance;
      for (const key in element) {
        if (
          key.startsWith("__reactInternalInstance") ||
          key.startsWith("__reactFiber$")
        ) {
          fiberNodeInstance = (element as Record<string, any>)[key];
        }
      }
      const {
        _debugSource: debugSource,
        elementType,
        pendingProps,
      } = fiberNodeInstance ?? {};
      if (debugSource) {
        this.setFirstHasSourceBundle(element as HTMLElement);
        return {
          source: debugSource,
          ComponentName: getElementTypeDisplayName(
            elementType,
            debugSource?.componentName
          ),
        };
      } else if (pendingProps?.[DATA_TAG]) {
        this.setFirstHasSourceBundle(element as HTMLElement);
        return getSourceFromProps(pendingProps);
      }
      const fallbackDebugSource = this.getFallbackDebugSource(
        fiberNodeInstance,
        element
      );
      return fallbackDebugSource;
    }

    getAllParentMaybePathFromFiber(
      element: HTMLElement,
      res: SourceType[]
    ): void {
      let fiberNodeInstance;
      for (const key in element) {
        if (
          key.startsWith("__reactInternalInstance") ||
          key.startsWith("__reactFiber$")
        ) {
          fiberNodeInstance = (element as Record<string, any>)[key];
        }
      }
      const {
        _debugSource: debugSource,
        elementType,
        pendingProps,
      } = fiberNodeInstance ?? {};
      if (debugSource) {
        this.setFirstHasSourceBundle(element as HTMLElement);
        res.push({
          source: debugSource,
          ComponentName: getElementTypeDisplayName(
            elementType,
            debugSource?.componentName
          ),
        });
      } else if (pendingProps?.[DATA_TAG]) {
        // Array.from((pendingProps?.children as any[]) || [])?.forEach((item) => {
        //   if (item?.$$typeof && item.props?.[DATA_TAG]) {
        //     res.push(getSourceFromProps(item.props));
        //   }
        // });
        this.setFirstHasSourceBundle(element as HTMLElement);
        res.push(getSourceFromProps(pendingProps));
      }

      this.pushAllFallbackDebugSource(fiberNodeInstance, res);
    }

    getAllChildrenMaybePathFromFiber(
      element: HTMLElement,
      res: SourceType[]
    ): void {
      let fiberNodeInstance;
      for (const key in element) {
        if (
          key.startsWith("__reactInternalInstance") ||
          key.startsWith("__reactFiber$")
        ) {
          fiberNodeInstance = (element as Record<string, any>)[key];
        }
      }

      const {
        _debugSource: debugSource,
        elementType,
        pendingProps,
      } = fiberNodeInstance ?? {};
      if (debugSource) {
        this.setFirstHasSourceBundle(element as HTMLElement);
        res.push({
          source: debugSource,
          ComponentName: getElementTypeDisplayName(
            elementType,
            debugSource?.componentName
          ),
        });
      } else if (pendingProps?.[DATA_TAG]) {
        this.setFirstHasSourceBundle(element as HTMLElement);
        res.push(getSourceFromProps(pendingProps));
      } else {
        const fallbackDebugSource = this.getFallbackDebugSource(
          fiberNodeInstance,
          element
        );
        if (fallbackDebugSource) {
          res.push(fallbackDebugSource);
        }
      }
    }

    getAllParentPaths(element: HTMLElement | null, resArr: SourceType[]) {
      if (!element) return;
      this.getAllParentMaybePathFromFiber(element, resArr);
      this.getAllParentPaths(element.parentElement, resArr);
    }

    getAllChildrenPath(element: HTMLElement, resArr: SourceType[]) {
      if (!element) return;
      this.getAllChildrenMaybePathFromFiber(element, resArr);
      element?.childNodes?.forEach((childNode) => {
        this.getAllChildrenPath(childNode as HTMLElement, resArr);
      });
    }
    getNoSameElementArr(arr: SourceType[]) {
      const tmpMap = new Map();
      arr.forEach((item) => {
        if (!item?.source) return;
        const key = `${item.source?.fileName}:${item.source?.lineNumber}`;
        if (tmpMap.get(key)) tmpMap.delete(key); //先删除原来的再塞进去新的，保证顺序问题。
        tmpMap.set(key, item);
      });
      return Array.from(tmpMap.values());
    }

    leftClickHandler(e: any) {
      this._firstHasSourceBundle = "";
      const allKeys = ["metaKey", "altKey", "shiftKey", "ctrlKey"];
      const selectedKeys = this.configs.hotKeys?.length
        ? this.configs.hotKeys
        : ["metaKey"];
      const unSelectedKeys = allKeys.filter(
        (key) => !selectedKeys.some((skey) => skey === key)
      );
      if (
        selectedKeys.every((key) => e[key]) &&
        unSelectedKeys.every((key) => !e[key])
      ) {
        e.preventDefault();
        e.stopPropagation();
        const { target } = e;
        if (target instanceof HTMLElement) {
          const sourceData = this.getElemPath(target);
          const bundle = getMaybeBundle(target);
          activeElement(target);
          this.eb.send(
            new RCMessage(RCMessageType.SINGLE, {
              sourceData,
              bundle,
              firstHasSourceBundle: this._firstHasSourceBundle,
            })
          );
        }
      }
    }
    rightClickHandler(e: any) {
      this._firstHasSourceBundle = "";
      const allKeys = ["metaKey", "altKey", "shiftKey", "ctrlKey"];
      const selectedKeys = this.configs.hotKeys?.length
        ? this.configs.hotKeys
        : ["metaKey"];
      const unSelectedKeys = allKeys.filter(
        (key) => !selectedKeys.some((skey) => skey === key)
      );
      if (
        selectedKeys.every((key) => e[key]) &&
        unSelectedKeys.every((key) => !e[key])
      ) {
        e.preventDefault();
        e.stopPropagation();
        const { target } = e;
        if (target instanceof HTMLElement) {
          const tmpParentArr: SourceType[] = [],
            tmpChildrenArr: SourceType[] = [];
          this.getAllParentPaths(target, tmpParentArr);
          this.getAllChildrenPath(target, tmpChildrenArr);
          const res = {
            [TabKey.ancestors]: this.getNoSameElementArr(tmpParentArr),
            [TabKey.descendants]: this.getNoSameElementArr(tmpChildrenArr),
          };
          const bundle = getMaybeBundle(target);
          activeElement(target);
          this.eb.send(
            new RCMessage(RCMessageType.MULTI, {
              sourceData: res,
              position: { x: e.pageX, y: e.pageY },
              bundle,
              firstHasSourceBundle: this._firstHasSourceBundle,
            })
          );
        }
      }
    }
  }

  function getSourceFromProps(sourceProps: any): SourceType {
    const { componentName, remotePrefix, fileName, lineNumber, columnNumber } =
      sourceProps?.[DATA_TAG];
    return {
      ComponentName: componentName,
      source: {
        remotePrefix,
        fileName,
        lineNumber: Number(lineNumber),
        columnNumber: Number(columnNumber),
      },
      isRemote: true,
    };
  }

  function getElementTypeDisplayName(
    elementType: any,
    sourceComponentName?: any
  ): string {
    if (elementType.displayName) {
      return elementType.displayName;
    }
    if (sourceComponentName) {
      return sourceComponentName;
    }

    if (typeof elementType === "function") {
      const name = elementType.name;
      if (name?.[0] >= "a" && name?.[0] <= "z") {
        return "ThirdPartyComponent";
      }
      return elementType.name || "";
    }
    if (typeof elementType === "string") {
      return elementType || "";
    }
    return "";
  }

  function getMaybeBundle(element: HTMLElement) {
    //get bundleName from ele
    return "maybe" ?? element.title;
  }

  function activeElement(target: HTMLElement) {
    target.classList.add("selected");
    const timer = setTimeout(() => {
      target.classList.remove("selected");
      clearTimeout(timer);
    }, 300);
  }
  const RCMSGTAG = "rc-message";

  class EventBridge {
    // private cbs: Array<(data: RCMessage<RCMessageType>) => void>;
    constructor() {
      // this.cbs = [];
    }
    send(data: RCMessage<RCMessageType>) {
      window.postMessage({ type: RCMSGTAG, data }, "*");
    }
    onMessage(cb: (data: RCMessage<RCMessageType>) => void) {
      window.addEventListener("message", (e) => {
        if (e.data.type === RCMSGTAG) {
          cb(e.data.data);
        }
      });
    }
  }
  const eventBridge = new EventBridge();

  new ReactSourceGetter(eventBridge, config);
}
