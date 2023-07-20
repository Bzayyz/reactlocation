import React, { Component } from "react";
import "./Popup.scss";
import HomePage from "./pages/HomePage";
import ListPage from "./pages/ListPage";
import SettingPage from "./pages/Settings";
import { Tabs } from "antd";
import { SettingOutlined, SwapOutlined } from "@ant-design/icons";

export default class Popup extends Component {
  render() {
    return (
      <div className={`${WRAPPER_CLASS_NAME}`}>
        <Tabs
          style={{ width: 300 }}
          size="small"
          items={[
            {
              label: (
                <>
                  <SwapOutlined style={{ marginLeft: 10 }} />
                </>
              ),
              key: "home",
              children: <HomePage />,
            },
            // {
            //   label: "List",
            //   key: "list",
            //   children: <ListPage />,
            // },
            {
              label: <SettingOutlined />,
              key: "settings",
              children: <SettingPage />,
            },
          ]}
          destroyInactiveTabPane
        />
      </div>
    );
  }
}
