export const openComponentInEditor = (tabId, Keys) => {
  const _tabId = "o" + tabId;
  if (window[_tabId]) return;
  window[_tabId] = true;
  const keyMap = {
    metaKey: "Command/Win",
    shiftKey: "shift",
    altKey: "Option",
    ctrlKey: "Ctrl",
  };
  console.log(
    `当前跳转编辑器快捷键为：${
      Keys.reduce((pre, cur, idx) => pre + (idx ? "+" : "") + keyMap[cur], "") +
      "+Click"
    }`
  );
  const getFallbackDebugSourceFromElement = (element) => {
    const parentElement = element.parentElement;
    if (element.tagName === "HTML" || parentElement === null) {
      console.warn("Couldn't find a React instance for the element");
      return;
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
    const { _debugSource, elementType } = fiberNodeInstance ?? {};
    if (_debugSource)
      return {
        source: _debugSource,
        ComponentName: elementType?.displayName ?? "",
      };
    return getFallbackDebugSourceFromElement(parentElement);
  };

  const getFallbackDebugSource = (fiberNodeInstance, element) => {
    if (fiberNodeInstance?._debugOwner) {
      if (fiberNodeInstance._debugOwner._debugSource) {
        return {
          source: fiberNodeInstance._debugOwner._debugSource,
          ComponentName:
            fiberNodeInstance._debugOwner?.elementType?.displayName ?? "",
        };
      } else {
        return getFallbackDebugSource(fiberNodeInstance._debugOwner, element);
      }
    } else {
      return getFallbackDebugSourceFromElement(element);
    }
  };

  const getElemPath = (element) => {
    let fiberNodeInstance;
    for (const key in element) {
      if (
        key.startsWith("__reactInternalInstance") ||
        key.startsWith("__reactFiber$")
      ) {
        fiberNodeInstance = element[key];
      }
    }
    const { _debugSource, elementType } = fiberNodeInstance ?? {};
    if (_debugSource)
      return {
        source: _debugSource,
        ComponentName: elementType?.displayName ?? "",
      };
    const fallbackDebugSource = getFallbackDebugSource(
      fiberNodeInstance,
      element
    );
    return fallbackDebugSource;
  };
  const getAllParentPaths = (element, resArr) => {
    if (!element) return;
    const thisPath = getElemPath(element) ?? "";
    resArr.push(thisPath);
    getAllParentPaths(element.parentElement, resArr);
  };

  const getAllChildrenPath = (element, resArr) => {
    if (!element) return;
    const thisPath = getElemPath(element) ?? "";
    resArr.push(thisPath);
    element?.childNodes?.forEach((childNode) => {
      getAllChildrenPath(childNode, resArr);
    });
  };
  const getNoSameElementArr = (arr) => {
    const tmpMap = new Map();
    arr.forEach((item) => {
      if (!item?.source) return;
      tmpMap.set(
        `${item.source?.fileName}:${item.source?.lineNumber}:${item.source?.columnNumber}`,
        item
      );
    });
    return Array.from(tmpMap.values());
  };

  if (window.vscodeListener) {
    window.removeEventListener("click", window.vscodeListener);
  }
  window.vscodeListener = window.addEventListener("click", (e) => {
    e.stopPropagation();
    let allKeys = ["metaKey", "altKey", "shiftKey", "ctrlKey"];
    let selectedKeys = Keys?.length ? Keys : ["metaKey"];
    let unSelectedKeys = allKeys.filter(
      (key) => !selectedKeys.some((skey) => skey === key)
    );
    if (
      selectedKeys.every((key) => e[key]) &&
      unSelectedKeys.every((key) => !e[key])
    ) {
      const { target } = e;
      // console.log(e);
      if (target instanceof HTMLElement) {
        const { source: elemPath } = getElemPath(target);
        if (elemPath) {
          window.postMessage({ type: "singleNodePath", data: elemPath }, "*");
        }
      }
    }
  });

  window.vscodeListener = window.addEventListener("contextmenu", (e) => {
    let allKeys = ["metaKey", "altKey", "shiftKey", "ctrlKey"];
    let selectedKeys = Keys?.length ? Keys : ["metaKey"];
    let unSelectedKeys = allKeys.filter(
      (key) => !selectedKeys.some((skey) => skey === key)
    );
    if (
      selectedKeys.every((key) => e[key]) &&
      unSelectedKeys.every((key) => !e[key])
    ) {
      e.preventDefault();
      const { target } = e;
      // console.log(e);
      if (target instanceof HTMLElement) {
        let tmpParentArr = [],
          tmpChildrenArr = [];
        getAllParentPaths(target, tmpParentArr);
        getAllChildrenPath(target, tmpChildrenArr);
        let res = {
          ancestors: getNoSameElementArr(tmpParentArr),
          descendants: getNoSameElementArr(tmpChildrenArr),
        };
        if (res?.ancestors?.length || res?.descendants?.length) {
          window.postMessage(
            {
              type: "allPath",
              data: res,
              position: { pageX: e.pageX, pageY: e.pageY },
            },
            "*"
          );
        }
      }
    }
  });
};
