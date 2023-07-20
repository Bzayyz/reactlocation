import React, { useEffect, useState } from "react";
import { Form, Input, Button, Tag, List, Pagination, Avatar } from "antd";
import "./index.scss";
import { useRequest } from "ahooks";
import styled from "styled-components";
const Root = styled.div`
  .form-button {
    min-width: 100px;
    border-radius: 5px;
  }
`;

const HomePage = () => {
  const [feature, setFeature] = useState(undefined);
  const [key, setKey] = useState("x-branch");
  const [curFeature, setCurFeature] = useState("");
  function changeFeature() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const curUrl = new URL(tabs[0]?.url);
      !feature
        ? curUrl.searchParams.delete(key)
        : !curUrl.searchParams.get(key)
        ? curUrl.searchParams.append(key, feature)
        : curUrl.searchParams.set(key, feature);
      chrome.tabs
        .update(tabs[0]?.id, {
          url: curUrl.href,
          selected: true,
        })
        .then(() => {
          setCurFeature(curUrl.searchParams.get(key) ?? "Main");
        });
    });
  }
  function goFeature(feature) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const curUrl = new URL(tabs[0]?.url);
      !curUrl.searchParams.get(key)
        ? curUrl.searchParams.append(key, feature)
        : curUrl.searchParams.set(key, feature);
      chrome.tabs
        .update(tabs[0]?.id, {
          url: curUrl.href,
          selected: true,
        })
        .then(() => {
          setCurFeature(curUrl.searchParams.get(key) ?? "Main");
        });
    });
  }

  // const {
  //   loading,
  //   run,
  //   data = { items: [], pagination: { current: 1, pageSize: 50, total: 0 } },
  // } = useRequest(async (page = 1, pageSize = 50) => {
  //   const { data } = await fetch(
  //     `https://deploy.bytedance.net/api/v1/deploy-unit/2506/small-traffic-channels?deployUnitId=2506&sortType=2&pageSize=${pageSize}&page=${page}&viewMode=2&filterType=1`,
  //     {
  //       headers: {
  //         accept: "application/json, text/plain, */*",
  //         "accept-language": "zh-CN,zh;q=0.9",
  //         lang: "zh",
  //         "origin-source": "web-ui",
  //         "sec-ch-ua":
  //           '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
  //         "sec-ch-ua-mobile": "?0",
  //         "sec-ch-ua-platform": '"macOS"',
  //         "sec-fetch-dest": "empty",
  //         "sec-fetch-mode": "cors",
  //         "sec-fetch-site": "same-origin",
  //         "x-jwt-token":
  //           "eyJhbGciOiJSUzI1NiIsImtpZCI6IiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwYWFzLnBhc3Nwb3J0LmF1dGgiLCJleHAiOjE2NzM1ODkxMDQsImlhdCI6MTY3MzU4NTQ0NCwidXNlcm5hbWUiOiJsaXl1YW56aGUuOTciLCJ0eXBlIjoicGVyc29uX2FjY291bnQiLCJyZWdpb24iOiJjbiIsInRydXN0ZWQiOnRydWUsInV1aWQiOiJkN2YwMDVmNS0yNmM3LTQ5YjctYTVlMi1iNzQyZjZkMTk5ODUiLCJzaXRlIjoib25saW5lIiwic2NvcGUiOiJieXRlZGFuY2UiLCJzZXF1ZW5jZSI6IlJEIiwib3JnYW5pemF0aW9uIjoi5Lqn5ZOB56CU5Y-R5ZKM5bel56iL5p625p6E6YOoLeaetuaehC3liY3nq68tQVBNIiwid29ya19jb3VudHJ5IjoiQ0hOIiwibG9jYXRpb24iOiJDTiIsImF2YXRhcl91cmwiOiJodHRwczovL3MxLWltZmlsZS5mZWlzaHVjZG4uY29tL3N0YXRpYy1yZXNvdXJjZS92MS92Ml8xYmEwMTk1Ni0wODI5LTQ3NDYtOWFmZS04ZWMzYWRhMzgzMmd-P2ltYWdlX3NpemU9bm9vcFx1MDAyNmN1dF90eXBlPVx1MDAyNnF1YWxpdHk9XHUwMDI2Zm9ybWF0PXBuZ1x1MDAyNnN0aWNrZXJfZm9ybWF0PS53ZWJwIiwiZW1haWwiOiJsaXl1YW56aGUuOTdAYnl0ZWRhbmNlLmNvbSIsImVtcGxveWVlX2lkIjozMDkwMTcyfQ.bkI3HPcr6qDgaFVcyVbEH6nc42Wn-scVn5EcG7fKIvIjIWYx6aWYPlPomS2sRfV_Kk5R7ce-DXCTYm8G0bhb6UlK3euRUBj9hpFUH4nFwOUv6-QIeMgTxOkRjAWbwSFLMmBhOi9o4gSZTJdpDR7UeyaXcpQ_pLg3rLZwRbV10AY",
  //       },
  //       referrer:
  //         "https://deploy.bytedance.net/app/1641/deploy_unit_list?deployUnitId=2506",
  //       referrerPolicy: "strict-origin-when-cross-origin",
  //       body: null,
  //       method: "GET",
  //       mode: "cors",
  //       credentials: "include",
  //     }
  //   ).then((response) => response.json());
  //   console.log(data);
  //   setPageOption(data?.pagination ?? { current: 1, pageSize: 50, total: 0 });
  //   return data;
  // });
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const curUrl = new URL(tabs[0]?.url);
      setCurFeature(curUrl.searchParams.get(key) ?? "undefined");
    });
  }, [key]);

  //回车键直接切换
  useEffect(() => {
    let listener = window.addEventListener("keypress", (e) => {
      if (e.keyCode === 13) changeFeature();
    });
    return window.removeEventListener("keypress", listener);
  });

  return (
    <Root>
      <span className="cur-feature">
        Current value: <Tag color="magenta">{curFeature}</Tag>
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
            {feature ? (
              <>
                Url param '<strong>{key}</strong>' = '<strong>{feature}</strong>
                '
              </>
            ) : (
              `Delete the url params : ${key}`
            )}
          </Button>
        </Form.Item>
      </Form>
    </Root>
  );
};

export default HomePage;
