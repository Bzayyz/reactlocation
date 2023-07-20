import React, { useEffect, useState } from "react";
import { Tag, List, Pagination, Avatar } from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import "./index.scss";
import { useRequest } from "ahooks";
import { get } from "../../../chrome";

const HomePage = () => {
  const [curFeature, setCurFeature] = useState("");
  const [key, setKey] = useState("x-branch");
  const [pageOption, setPageOption] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });

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

  const {
    loading,
    run,
    data = { items: [], pagination: { current: 1, pageSize: 50, total: 0 } },
  } = useRequest(async (page = 1, pageSize = 50) => {
    const tmptoken = await get("deploy-token");
    const { data } = await fetch(
      `https://deploy.bytedance.net/api/v1/deploy-unit/2506/small-traffic-channels?deployUnitId=2506&sortType=2&pageSize=${pageSize}&page=${page}&viewMode=2&filterType=1`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          lang: "zh",
          "origin-source": "web-ui",
          "sec-ch-ua":
            '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-jwt-token": tmptoken,
        },
        referrer:
          "https://deploy.bytedance.net/app/1641/deploy_unit_list?deployUnitId=2506",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    ).then((response) => response.json());
    console.log(data);
    setPageOption(data?.pagination ?? { current: 1, pageSize: 50, total: 0 });
    return data;
  });
  const renderStatus = (status) => {
    switch (+status) {
      case 4:
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            部署成功
          </Tag>
        );
      case 7:
        return (
          <Tag color="default" icon={<MinusCircleOutlined />}>
            部署取消
          </Tag>
        );
      case 3:
        return (
          <Tag color="processing" icon={<SyncOutlined spin />}>
            部署中
          </Tag>
        );
      default:
        return <Tag>Uknown Status</Tag>;
    }
  };
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const curUrl = new URL(tabs[0]?.url);
      setCurFeature(curUrl.searchParams.get("x-branch") ?? "Main");
    });
  }, []);

  return (
    <div className="text-red-500">
      <span>
        Current branch: <Tag color="magenta">{curFeature}</Tag>
      </span>
      <div
        id="scrollableDiv"
        style={{
          height: 300,
          width: 300,
          marginTop: 8,
          overflow: "auto",
          padding: "0 16px",
          border: "1px solid rgba(140, 140, 140, 0.35)",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={data?.items}
          loading={loading}
          renderItem={(item) => {
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        setKey(
                          item?.conditionData?.children?.[0]?.query?.key ??
                            "x-branch"
                        );
                        goFeature(
                          item?.conditionData?.children?.[0]?.query?.value
                        );
                      }}
                    >
                      {item?.conditionData?.children?.[0]?.query?.value}
                    </a>
                  }
                  description={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="creator">
                        {item?.creator?.split("@")?.[0]}
                      </div>
                      <div className="status">
                        {renderStatus(item?.lastDeployment?.status)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
      <Pagination
        style={{
          marginTop: 8,
          marginBottom: 8,
          display: "flex",
          justifyContent: "center",
        }}
        {...pageOption}
        size="small"
        onChange={(page, pageSize) => {
          console.log(page, pageSize);
          setPageOption((pre) => ({ ...pre, current: page, pageSize }));
          run(page, pageSize);
        }}
      ></Pagination>
    </div>
  );
};

export default HomePage;
