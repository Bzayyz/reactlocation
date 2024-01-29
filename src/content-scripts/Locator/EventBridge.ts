import type { PathSources, SourceType } from './types';

export enum RCMessageType {
  'SINGLE' = 'single',
  'MULTI' = 'multi',
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

export class EventBridge {
  private cbs: Array<(data: RCMessage<RCMessageType>) => void>;
  constructor() {
    this.cbs = [];
  }
  send(data: RCMessage<RCMessageType>) {
    this.cbs.forEach((cb) => cb(data));
  }
  onMessage(cb: (data: RCMessage<RCMessageType>) => void) {
    this.cbs.push(cb);
  }
}
export const eventBridge = new EventBridge();
