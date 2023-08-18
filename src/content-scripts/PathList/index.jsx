import React from "react";
import styled from "styled-components";
import { useDebounce } from "ahooks";
import autoAnimate from "@formkit/auto-animate";

const Root = styled.div`
  background-color: white;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
  padding: 4px;
  max-height: 300px;
  max-width: 330px;
  min-width: 250px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 1px !important;
  }
  transition: all 0.5s;

  svg {
    width: 1.2em;
    height: 1.2em;
  }
  .svg-close {
    fill: grey;
    bottom: -30px;
    left: calc(50% - 10px);
    cursor: pointer;
    position: absolute;
    transition: all 0.4s;
    :hover {
      transform: scale(1.1);
      fill: red;
    }
  }
  .title {
    position: absolute;
    left: 10px;
    top: -25px;
    display: flex;
    justify-content: flex-start;
    gap: 8px;
    align-items: center;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.7);
    .title_pane {
      line-height: 20px;
      border-radius: 4px;
      cursor: pointer;
      color: #b2aac5;
      transition: all 0.4s;
      :hover {
        transform: scale(1.02);
        color: #7335d7;
      }
    }
    .title_pane.active {
      color: #7335d7;
    }
    input {
      transition: all 0.5s;
      width: 100%;
      height: 24px;
      appearance: none;
      border: 0;
      border-bottom: 1px solid #b2aac5;
      border-radius: 0;
      background-color: rgba(255, 255, 255, 0.7);
      padding: 0.5em;
      flex-grow: 1;
      min-width: none;
      width: 100%;
      display: block;
    }
  }

  .node_detail {
    position: absolute;
    padding: 4px;
    max-width: 170px;
    right: -175px;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 8px;
    align-items: flex-start;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.7);
    .detail_label {
      word-break: break-all;
    }
  }

  ul {
    list-style-type: none;
    padding: 0;
    max-width: 300px;
  }
  li {
    display: flex;
    justify-content: space-between;
    padding: 0.75em;
    background-color: white;
    margin-bottom: 0.5em;
    border-radius: 0.5em;
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.1);
    font-size: 0.875em;
    transition: all 0.3s;
    cursor: pointer;
    :hover {
      z-index: 99999;
      transform: scale(1.02);
      background-color: #f0eafe;
      /* box-shadow: rgba(0, 0, 0, 0.2) 0px 12px 28px 0px,
        rgba(0, 0, 0, 0.1) 0px 2px 4px 0px,
        rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset; */
      box-shadow: rgba(136, 165, 191, 0.48) 6px 2px 16px 0px,
        rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;
    }
  }

  li::before {
    display: none;
  }

  li button {
    appearance: none;
    border: none;
    padding: none;
    margin: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .file_name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }

  .comp_name {
    color: #7335d7;
    width: fit-content;
    margin-left: 8px;
  }

  /* [tooltip]::after {
    content: attr(tooltip);
    position: fixed;
    background: rgba(255, 255, 255, 0.7);
    text-align: center;
    color: black;
    border-radius: 5px;
    padding: 4px 2px;
    word-break: break-all;
    max-width: 400px;
    pointer-events: none;
    z-index: 99;
    opacity: 0;

    left: 50%;
    top: -5px;
    transform: translateX(-50%) translateY(-100%);
  }
  [tooltip]:hover::after {
    opacity: 1;
  }
  [tooltip][position="right"]::after {
    top: 50%;
    left: 100%;
    margin-left: 5px;
    transform: translateY(-50%);
  } */
`;
const itemHasStr = (item, filterStr) => {
  const str = filterStr.toLowerCase();
  return (
    item?.source?.fileName.toLowerCase().indexOf(str) !== -1 ||
    item?.ComponentName.toLowerCase().indexOf(str) !== -1
  );
};

function PathList({ pathList, jumpToEditor, close, position, buildTool }) {
  const [key, setDataKey] = React.useState("ancestors");
  const [node, setCurrentNode] = React.useState(null);
  const [filterStr, setFilter] = React.useState("");

  const currentNode = useDebounce(node, { wait: 300 });
  const str = useDebounce(filterStr, { wait: 300 });

  const handleChangeTab = (e, key) => {
    e.stopPropagation();
    setDataKey(key);
    e.target?.parentNode?.childNodes?.forEach((node) =>
      node.classList.remove("active")
    );
    e.target?.classList.add("active");
  };
  const parent = React.useRef(null);

  React.useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const resArr = React.useMemo(() => {
    return pathList?.[key]?.filter((item) => itemHasStr(item, str));
  }, [key, str, pathList]);

  return (
    <Root position={position}>
      <svg
        className="svg-close"
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
        <div className="node_detail">
          <div className="detail_label">
            <strong>Path: </strong>
            {currentNode?.source?.fileName}
          </div>
          <div className="detail_label">
            <strong>Line:column: </strong>
            {currentNode?.source?.lineNumber}:
            {currentNode?.source?.columnNumber}
          </div>
          {currentNode?.ComponentName ? (
            <div className="detail_label">
              <strong>Component: </strong>
              {currentNode?.ComponentName}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="title" onClick={(e) => e.stopPropagation()}>
        <div
          className="title_pane active"
          onClick={(e) => handleChangeTab(e, "ancestors")}
        >
          Ancestors
        </div>
        <div
          className="title_pane"
          onClick={(e) => handleChangeTab(e, "descendants")}
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
        {resArr?.length ? (
          resArr?.map((item, index) => {
            return (
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToEditor(item?.source);
                }}
                key={index}
                onMouseEnter={() => {
                  setCurrentNode(item);
                }}
                onMouseLeave={() => {
                  setCurrentNode(null);
                }}
                // tooltip={item?.source?.fileName}
                // position="right"
              >
                <div className="file_name">
                  {
                    item?.source?.fileName.includes("\\")?("...\\" +item?.source?.fileName?.split("\\")?.slice(-2)?.join("\\")??
                    "-"):(".../" +item?.source?.fileName?.split("/")?.slice(-2)?.join("/")??
                    "-") }
                </div>
                <button className="comp_name">
                  {item?.ComponentName ?? ""}
                </button>
              </li>
            );
          })
        ) : (
          <li>
            <strong>No data</strong>
          </li>
        )}
      </ul>
    </Root>
  );
}

export default PathList;
