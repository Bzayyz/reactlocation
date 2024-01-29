import React from "react";
import { useDebounce } from "ahooks";
import autoAnimate from "@formkit/auto-animate";
import classNames from "classnames";

import { Tag } from "antd";

import { TabKey } from "../../types";
import type {
  Direction,
  FileSource,
  PathSources,
  SourceType,
} from "@/Locator/types";
import { JumpType } from "@/Locator/types";

import styles from "./index.module.less";

const Filter = (item: SourceType, filterStr: string) => {
  const str = filterStr.toLowerCase();
  return (
    item?.source?.fileName?.toLowerCase()?.indexOf(str) !== -1 ||
    item?.ComponentName?.toLowerCase()?.indexOf(str) !== -1
  );
};

export interface PathListProps {
  pathList: PathSources;
  jumpToEditor: (
    fileSource: FileSource,
    type?: JumpType,
    isRemote?: boolean
  ) => void;
  close: () => void;
  listDirection: Direction;
  clickElementBundle: string;
  firstHasSourceBundle: string;
}

function PathList({
  pathList,
  jumpToEditor,
  close,
  listDirection,
  clickElementBundle,
  firstHasSourceBundle,
}: PathListProps) {
  const [key, setDataKey] = React.useState<TabKey>(TabKey.ancestors);
  const [node, setCurrentNode] = React.useState<SourceType | null>(null);
  const [filterStr, setFilter] = React.useState<string>("");

  const currentNode = useDebounce(node, { wait: 100 });
  const str: string = useDebounce(filterStr, { wait: 300 });
  const handleChangeTab = (e: any, _key: TabKey) => {
    e.stopPropagation();
    setDataKey(_key);
    e.target?.parentNode?.childNodes?.forEach((_node: any) =>
      _node.classList.remove(styles.active)
    );
    e.target?.classList.add(styles.active);
  };

  const parent = React.useRef(null);

  React.useEffect(() => {
    if (parent.current) autoAnimate(parent.current);
  }, [parent]);

  const resArr = React.useMemo(() => {
    return pathList?.[key]?.filter((item) => Filter(item, str));
  }, [key, str, pathList]);

  return (
    <div className={styles.listContainer}>
      <svg
        className={styles.svgClose}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        x="0px"
        y="0px"
        data-v-7f7c4f2a=""
      >
        <path d="M27.19,7.64a2,2,0,1,0-2.83-2.83l-6.95,6.95a2,2,0,0,1-2.83,0L7.64,4.81A2,2,0,0,0,4.81,7.64l6.95,6.95a2,2,0,0,1,0,2.83L4.81,24.36a2,2,0,1,0,2.83,2.83l6.95-6.95a2,2,0,0,1,2.83,0l6.95,6.95a2,2,0,1,0,2.83-2.83l-6.95-6.95a2,2,0,0,1,0-2.83Z"></path>
      </svg>
      {currentNode ? (
        <div
          className={classNames(
            styles.nodeDetail,
            styles[`expandDirection${listDirection}`]
          )}
        >
          {currentNode?.isRemote && (
            <div className={styles.detailLabel}>
              <Tag color="cyan">远程组件</Tag>
              <br />
              <strong>
                {`${currentNode?.source?.remotePrefix?.split("/")?.[0]}/${
                  currentNode?.source?.remotePrefix?.split("/")?.[1]
                }`}
              </strong>
            </div>
          )}
          <div className={styles.detailLabel}>
            <strong>Path: </strong>
            {currentNode?.source?.fileName}
          </div>
          <div className={styles.detailLabel}>
            <strong>Line:column: </strong>
            {currentNode?.source?.lineNumber}:
            {currentNode?.source?.columnNumber}
          </div>
          {currentNode?.ComponentName ? (
            <div className={styles.detailLabel}>
              <strong>Component: </strong>
              {currentNode?.ComponentName}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={styles.title} onClick={(e) => e.stopPropagation()}>
        <div
          className={classNames(styles.titlePane, styles.active)}
          onClick={(e) => handleChangeTab(e, TabKey.ancestors)}
        >
          Ancestors
        </div>
        <div
          className={styles.titlePane}
          onClick={(e) => handleChangeTab(e, TabKey.descendants)}
        >
          Descendants
        </div>
        <input
          placeholder="filter"
          value={filterStr}
          onChange={(e) => setFilter(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <ul ref={parent}>
        {(function renderList() {
          if (resArr?.length) {
            return (
              <>
                {clickElementBundle === firstHasSourceBundle ? null : (
                  <li
                    className={styles.noData}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <strong>
                      该组件为未接入远程 bundle 的拓展点，
                      {clickElementBundle && (
                        <>
                          代码可能在远程仓库：
                          <a
                            href={getBundleUrl(clickElementBundle)}
                            target="__code"
                          >
                            {clickElementBundle}
                          </a>
                        </>
                      )}
                      <br />
                      <span className={styles.greyText}>
                        精准定位请接入对应项目：
                      </span>
                      <a
                        href="https://aliyuque.antfin.com/ai7qv3/egrme2/hq6q6f9dp7z94k45"
                        target="__code"
                      >
                        接入指南
                      </a>
                      {/* / 远程 bundle 未接入 <a>接入指南</a> */}
                    </strong>
                  </li>
                )}
                {resArr?.map((item, index) => {
                  return (
                    <li
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToEditor(
                          item?.source,
                          JumpType.tree,
                          item?.isRemote
                        );
                      }}
                      key={index}
                      onMouseEnter={() => {
                        setCurrentNode(item);
                      }}
                      onMouseLeave={() => {
                        setCurrentNode(null);
                      }}
                    >
                      <div className={styles.fileName}>
                        {item?.isRemote && <Tag color="cyan">R</Tag>}
                        <span>
                          {item?.source?.fileName.includes("\\")
                            ? "...\\" +
                                (item?.source?.fileName
                                  ?.split("\\")
                                  ?.slice(-2)
                                  ?.join("\\") as string) || "-"
                            : ".../" +
                                (item?.source?.fileName
                                  ?.split("/")
                                  ?.slice(-2)
                                  ?.join("/") as string) || "-"}
                        </span>
                      </div>
                      <span className={styles.compName}>
                        {item?.ComponentName ?? ""}
                      </span>
                    </li>
                  );
                })}
              </>
            );
          }
          return (
            <li
              className={styles.noData}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <strong>
                无 React 组件 / 非本地 bundle
                <br />
                {clickElementBundle && (
                  <>
                    该组件的代码可能在远程仓库：
                    <br />
                    <a href={getBundleUrl(clickElementBundle)} target="__code">
                      {clickElementBundle}
                    </a>
                  </>
                )}
                <br />
                <span className={styles.greyText}>
                  精准定位请接入对应项目：
                </span>
                <a
                  href="https://aliyuque.antfin.com/ai7qv3/egrme2/hq6q6f9dp7z94k45"
                  target="__code"
                >
                  接入指南
                </a>
                {/* / 远程 bundle 未接入 <a>接入指南</a> */}
              </strong>
            </li>
          );
        })()}
      </ul>
    </div>
  );

  function getBundleUrl(bundle: string) {
    //自定义get远程bundle方法
    return "";
  }
}

export default PathList;
