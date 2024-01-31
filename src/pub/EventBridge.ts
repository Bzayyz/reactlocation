import { contentClient } from "../chrome";
import type { LocatorConfigs, PathSources, SourceType } from "./types";

export enum RCMessageType {
  "SINGLE" = "single",
  "MULTI" = "multi",
}

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

export type RCMessageData<T extends RCMessageType> = RcMessageType2DataType[T];

export class RCMessage<T extends RCMessageType> {
  type: RCMessageType;
  data: RCMessageData<T>;
  constructor(type: T, data: RCMessageData<T>) {
    this.type = type;
    this.data = data;
  }
}

const CHANGE_CONFIG = "config-change";
const RCMSGTAG = "rc-message";

export class EventBridge {
  constructor() {}
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

export class ConfigEventBridge {
  constructor() {}
  send(data: Partial<LocatorConfigs>) {
    contentClient.seedMessage({ msg: CHANGE_CONFIG, params: data });
  }
  onMessage(cb: (data: Partial<LocatorConfigs>) => void) {
    contentClient.listen(CHANGE_CONFIG, (e) => {
      if (e.msg === CHANGE_CONFIG) {
        cb(e.params);
      }
    });
  }
}

export const configEventBridge = new ConfigEventBridge();
export const eventBridge = new EventBridge();
