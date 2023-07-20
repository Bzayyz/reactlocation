import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Tag } from "antd";
import "./index.scss";
import { contentClient, ChromeMessage } from "../../chrome";

const DrawerDemo = ({ onClose }) => {
  const [messageFromBg, setMessageFromBg] = useState("");
  const [open, setOpen] = React.useState(true);
  const [feature, setFeature] = useState(undefined);
  const [key, setKey] = useState("x-branch");
  const [curFeature, setCurFeature] = useState("");

  // Background 通讯
  async function sendMsgToBackground() {
    const res = await contentClient.seedMessage(
      new ChromeMessage("change branch")
    );

    setMessageFromBg(res.msg);
  }

  function changeFeature() {
    const curUrl = new URL(location.href);
    !feature
      ? curUrl.searchParams.delete(key)
      : !curUrl.searchParams.get(key)
      ? curUrl.searchParams.append(key, feature)
      : curUrl.searchParams.set(key, feature);
    setCurFeature(curUrl.searchParams.get(key) ?? "Main");
    location.replace(curUrl.href);
  }

  useEffect(() => {
    const curUrl = new URL(location.href);
    setCurFeature(curUrl.searchParams.get(key) ?? "Main");
  }, [key]);

  useEffect(() => {
    let listener = window.addEventListener("keypress", (e) => {
      if (e.keyCode === 13) changeFeature();
    });
    return window.removeEventListener("keypress", listener);
  });

  return (
    <Modal
      getContainer={document.querySelector(
        "#chrome-extension-content-base-element"
      )}
      title="Switch the branch"
      footer={null}
      onOk={() => {
        setOpen(false);
        setTimeout(() => {
          onClose();
          setOpen(true);
        }, 1000);
      }}
      onCancel={() => {
        setOpen(false);
        setTimeout(() => {
          onClose();
          setOpen(true);
        }, 1000);
      }}
      open={open}
    >
      <span className="cur-feature">
        Current branch: <Tag color="magenta">{curFeature}</Tag>
      </span>
      <Form
        layout="Vertical"
        name="basic"
        className="basic-table"
        style={{ marginTop: 16 }}
        initialValues={{ remember: true }}
      >
        <Form.Item
          name="feature"
          rules={[
            {
              required: true,
              warningOnly: true,
              message: "You will be redirected to the Main branch",
            },
          ]}
          validator
        >
          <Input.Group compact>
            <Input
              style={{ width: "30%" }}
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <Input
              style={{ width: "70%" }}
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="Enter the Main branch when the input is empty"
            />
          </Input.Group>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={() => {
              changeFeature();
            }}
            className="form-button"
          >
            {`Switch to ${key}: ${feature || "Main"}`}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default DrawerDemo;
