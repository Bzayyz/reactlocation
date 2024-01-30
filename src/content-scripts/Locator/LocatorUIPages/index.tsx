import { useEffect, useState } from "react";

import {
  Button,
  Checkbox,
  Collapse,
  Input,
  Radio,
  Space,
  Tabs,
  message,
} from "antd";

import { Editor } from "../types";
import { HotKey } from "../types";
import { configManager } from "../ConfigManager";

export function LocatorUI() {
  const [editor, setEditor] = useState<Editor>();
  const [customPath, setCustomPath] = useState<string>();
  const [hotKeys, setHotKeys] = useState<HotKey[]>([]);

  useEffect(() => {
    const config = configManager.configs;
    setEditor(config.editor);
    setCustomPath(config.customPath);
    setHotKeys(config.hotKeys);
  }, []);

  return (
    <Tabs>
      <Tabs.TabPane tab="自定义配置" key="2">
        <div style={{ height: "450px", overflow: "auto" }}>
          <Collapse bordered={false} defaultActiveKey={["3"]}>
            <Collapse.Panel header="编辑器" key="2">
              <Radio.Group
                value={editor}
                onChange={(e) => {
                  setEditor(e.target.value as Editor);
                }}
              >
                <Space direction="vertical">
                  <Radio value="vscode">vscode</Radio>
                  <Radio value="vscode-insiders">vscode-insiders</Radio>
                  <Radio value="webStorm">webStorm</Radio>
                </Space>
              </Radio.Group>
            </Collapse.Panel>
            <Collapse.Panel header="自定义远程跳转路径" key="5">
              <p>
                {
                  "用 ${pathName}、${lineNumber} 、${columnNumber} 这三个变量组合自定义的远程跳转路径。fileName中已经拼好了项目名，一般只需要拼接自己的本地路径即可。"
                }
              </p>

              <p>{"例如: "}</p>
              <p>
                {
                  "vscode://file/Users/jinli/Desktop/projects/${fileName}:${lineNumber}"
                }
              </p>
              <Input
                value={customPath}
                onChange={(e) => {
                  setCustomPath(e.target.value);
                }}
              />
            </Collapse.Panel>
            <Collapse.Panel header="快捷键" key="3">
              按任意顺序组合快捷键，同时按住组合的快捷键再点击/右击即可跳转
              <Checkbox.Group
                style={{ marginTop: 10 }}
                value={hotKeys}
                options={[
                  { label: "Command/Win", value: HotKey.metaKey },
                  { label: "Option", value: HotKey.altKey },
                  { label: "Shift", value: HotKey.shiftKey },
                ]}
                onChange={(v) => {
                  setHotKeys(v.length ? (v as HotKey[]) : [HotKey.metaKey]);
                }}
              />
            </Collapse.Panel>
          </Collapse>
        </div>
        <Button
          onClick={() => {
            saveConfig();
            message.success("保存成功！");
          }}
        >
          保存配置
        </Button>
      </Tabs.TabPane>
      <Tabs.TabPane tab="使用指北" key="1">
        <div style={{ height: "480px", overflow: "auto" }}>
          语雀：
          <a
            href="https://aliyuque.antfin.com/ai7qv3/egrme2/nby3c974msbkbar3"
            target="__blank"
            style={{ fontSize: 24 }}
          >
            详细文档
          </a>
          <br />
          <h2>用途</h2>
          <p id="test">
            ReactLocator 通常在本地开发环境使用。ReactLocator
            可以帮助你快速定位并直接跳转到 React 组件代码的位置。目前，Locator
            无需任何配置就支持定位已经在本地运行的程序集/拓展点/小程序。例如，如果想找工单代码，请先
            pnpm start 工单项目。 <br />
            <a
              href=" https://code.alibaba-inc.com/xixikf-appx/reactlocator"
              target="blank"
            >
              小程序源码
            </a>
            {"        "}
            <a
              href="https://github.com/facebook/react/blob/5c607369ceebe56d85175df84b7b6ad58dd25e1f/packages/react-reconciler/src/ReactChildFiber.js#L450"
              target="blank"
            >
              React相关源码
            </a>
            <br />
          </p>
          <br />
          <h2>基本使用</h2>
          <p>
            按住command快捷键，再点击鼠标左键/右键就可以直接跳转了，记得第一次跳转的时候在vscode弹窗时勾选
            "以后都允许"。 快捷键、跳转路径、编辑器都可以自定义。
          </p>
          <br />
          <p>
            目前只支持跳转 <strong>本地启动</strong>{" "}
            的程序集/小程序/拓展点等资源的跳转，且不会入侵/hack项目代码，可以放心使用。
          </p>
          <p>
            本地启动的程序集/小程序/拓展点等资源的跳转，不会入侵/hack项目代码，可以放心使用。
            线上资源目前只支持跳到对应项目code平台的主页。实验室功能支持远程跳转到具体代码位置。
          </p>
          <br />
          <h2>右键菜单</h2>
          <p>
            右键菜单的最上方有两个tab，Ancestors（所有祖先）和
            Descendants（所有子孙），点击切换看看？
            祖先列表涵盖了从当前点击的节点到根节点的所有祖先，子孙列表涵盖了从当前点击的节点到叶子节点的所有子孙。
            另外，点击左上角可以 filter 过滤检索。
          </p>
          <br />
          <h2>实验室</h2>
          <p>
            远程组件跳转目前已经有POC实现，需要对应项目的接入：
            <a
              href="https://aliyuque.antfin.com/ai7qv3/egrme2/hq6q6f9dp7z94k45"
              target="blank"
            >
              如何实现远程项目的代码跳转
            </a>
          </p>
          <br />
          <p>设置了DisplayName的组件会在列表右侧展示组件名，以方便检索。</p>
          <br />
          <h2>TODO</h2>
          <p>1. 增强的交互形式，例如树形展示、hover组件ui更精准跳转</p>
          <p>2. 非本地程序集跳转</p>
          <p>
            4. 有疑问/合作想法 请联系<strong>瑾蠡</strong>
          </p>
          <br />
        </div>
      </Tabs.TabPane>
    </Tabs>
  );
  function saveConfig() {
    configManager.setConfigs({
      editor: editor ?? Editor.vscode,
      customPath,
      hotKeys,
    });
  }
}
