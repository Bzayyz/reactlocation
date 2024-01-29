import type { EventBridge } from './EventBridge';

export interface LocatorViewProps {
  eb: EventBridge;
  configs: LocatorConfigs;
}

export const enum LocatorViewMode {
  SINGLE = 'single',
  MULTI = 'multi',
}

export type SourceType = {
  source: FileSource;
  ComponentName: string;
  bundle?: string;
  isRemote?: boolean;
};

export type FileSource = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  remotePrefix?: string;
};

export const enum TabKey {
  ancestors = 'ancestors',
  descendants = 'descendants',
}

export type PathSources = Record<TabKey, SourceType[]>;

export const enum BuildTool {
  webpack = 'webpack',
  vite = 'vite',
  rspack = 'rspack',
  other = 'other',
}

export const enum Editor {
  vscode = 'vscode',
  webstorm = 'webstorm',
}

export const enum HotKey {
  metaKey = 'metaKey',
  altKey = 'altKey',
  shiftKey = 'shiftKey',
  ctrlKey = 'ctrlKey',
}

export interface LocatorConfigs {
  buildTool: BuildTool;
  editor: Editor;
  hotKeys: Array<HotKey>;
  customPath?: string;
}

export const enum Direction {
  rightBottom = 0,
  rightTop = 1,
  leftBottom = 2,
  leftTop = 3,
}

export const enum JumpType {
  tree = 'tree',
  compare = 'commit',
}
