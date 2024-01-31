import { useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";

import {
  CLOUD_PREFIX,
  CODE_SITE_LINE_JOINER,
  CODE_SITE_URL,
} from "../remoteConfigs";

import type {
  FileSource,
  LocatorViewProps,
  PathSources,
} from "../../../pub/types";
import { JumpType } from "../../../pub/types";
import {
  BuildTool,
  Direction,
  Editor,
  LocatorViewMode,
} from "../../../pub/types";
import type { RCMessage } from "../../../pub/EventBridge";
import { RCMessageType } from "../../../pub/EventBridge";
import { CONTAINER_WIDTH, TOOLTIP_WIDTH } from "./const";

export const useViewStates = (props: LocatorViewProps) => {
  const { eb, configs } = props;

  useEffect(() => {
    initEbListener();
    window.addEventListener("click", closeHandler);
    return () => {
      window.removeEventListener("click", closeHandler);
    };
  }, []);

  const [viewMode, setViewMode] = useState<LocatorViewMode>(
    LocatorViewMode.SINGLE
  );
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [sourceData, setSourceData] = useState<PathSources | null>();
  const [visible, setVisible] = useState(false);
  const [displayDirection, setDisplayDirection] = useState<Direction>(
    Direction.rightBottom
  );
  const [clickElementBundle, setClickElementBundle] = useState<string>("");
  const [firstHasSourceBundle, setFirstHasSourceBundle] = useState<string>("");
  const rootRef = useRef<HTMLDivElement>(null);

  return {
    viewMode,
    position,
    sourceData,
    visible,
    rootRef,
    clickElementBundle,
    firstHasSourceBundle,
    jumpToEditor,
    closeContainer,
    displayDirection,
  };

  function closeContainer() {
    setVisible(false);
  }

  function initEbListener() {
    eb.onMessage((message) => {
      const type = message.type;
      if (type === RCMessageType.SINGLE) {
        setViewMode(LocatorViewMode.SINGLE);
        const {
          sourceData: elemSource,
          // bundle: newBundle,
          // firstHasSourceBundle: newFirstHasSourceBundle,
        } = (message as RCMessage<RCMessageType.SINGLE>).data;

        if (!elemSource) return;
        jumpToEditor(elemSource.source, JumpType.tree, elemSource.isRemote);
        // }
      } else if (RCMessageType.MULTI) {
        const {
          sourceData: newSource,
          position: newPos,
          bundle: newBundle,
          firstHasSourceBundle: newFirstHasSourceBundle,
        } = (message as RCMessage<RCMessageType.MULTI>).data;
        unstable_batchedUpdates(() => {
          setPosition(newPos);
          setDisplayDirection(() => getDisplayDirection(newPos));
          setClickElementBundle(newBundle || "");
          setFirstHasSourceBundle(newFirstHasSourceBundle || "");
          setSourceData(newSource);
          setViewMode(LocatorViewMode.MULTI);
          setVisible(true);
        });
      }
    });
  }

  function closeHandler(e: Event) {
    if (e.target !== rootRef.current) {
      closeContainer();
    }
  }

  function jumpToEditor(
    elemPath: FileSource,
    type: JumpType = JumpType.tree,
    isRemote: boolean = false
  ) {
    const url = getJumpUrl(elemPath, type, isRemote);
    if (isRemote && url) {
      window.open(url, "__code");
    }
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => {
      iframe.remove();
    }, 100);
  }

  function getJumpUrl(elemPath: FileSource, type: JumpType, isRemote: boolean) {
    const { columnNumber, fileName, lineNumber, remotePrefix } = elemPath;
    let url = "";
    let resFileName = fileName;
    if (configs.buildTool === BuildTool.rspack) {
      resFileName = fileName.match(/^<(.*)>$/)?.[1] ?? "";
    }

    if (configs.customPath) {
      if (isRemote && remotePrefix) {
        const tmp = remotePrefix.split("/");
        resFileName = resFileName.replace(CLOUD_PREFIX, tmp[1] + "/");
        return replacePlaceholders(
          configs.customPath,
          resFileName,
          lineNumber,
          columnNumber
        );
      }
    }
    if (isRemote && remotePrefix) {
      const tmp = remotePrefix.split("/");
      tmp.splice(2, 0, type);
      return `${resFileName.replace(
        CLOUD_PREFIX,
        `${CODE_SITE_URL}${tmp.join("/")}`
      )}${CODE_SITE_LINE_JOINER}${lineNumber}`;
    }
    if (configs.editor === Editor.webstorm) {
      url = `webstorm://open?file=${fileName}&line=${lineNumber}&column=${columnNumber}`;
    } else {
      url = `${
        configs.editor || Editor.vscode
      }://file/${fileName}:${lineNumber}:${columnNumber}`;
    }
    return url;
  }
};

function getDisplayDirection(
  position: { x: number; y: number },
  containerSize: { x: number; y: number } = {
    x: CONTAINER_WIDTH + TOOLTIP_WIDTH,
    y: CONTAINER_WIDTH,
  },
  rootContainerSize: { x: number; y: number } = {
    x: document.body.offsetWidth,
    y: document.body.offsetHeight,
  }
): Direction {
  const bottomRemainingSize = rootContainerSize.y - position.y,
    rightRemainingSize = rootContainerSize.x - position.x;

  if (
    bottomRemainingSize < containerSize.y ||
    rightRemainingSize < containerSize.x
  ) {
    if (
      bottomRemainingSize < containerSize.y &&
      rightRemainingSize < containerSize.x
    ) {
      return Direction.leftTop;
    }
    if (rightRemainingSize < containerSize.x) {
      return Direction.leftBottom;
    }
    if (bottomRemainingSize < containerSize.y) {
      return Direction.rightTop;
    }
  }
  //计算应该延展的方向
  return Direction.rightBottom;
}

function replacePlaceholders(
  str: string,
  fileName: string,
  lineNumber: number,
  columnNumber: number
) {
  const regex = /\$\{fileName\}|\$\{lineNumber\}|\$\{columnNumber\}/g;
  return str.replace(regex, (match) => {
    switch (match) {
      case "${fileName}":
        return fileName;
      case "${lineNumber}":
        return `${lineNumber}`;
      case "${columnNumber}":
        return `${columnNumber}`;
      default:
        return match;
    }
  });
}
