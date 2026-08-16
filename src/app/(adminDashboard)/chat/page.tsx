import { Tabs } from "antd";
import React from "react";
import CustomerSupport from "./_components/CustomerSupport";
import GuestUsersMessages from "./_components/GuestUsersMessages";

const items = [
  {
    key: "1",
    label: "Customer Support",
    children: <CustomerSupport />,
  },
  {
    key: "2",
    label: "Guest Users Messages",
    children: <GuestUsersMessages />,
  },
];

export default function page() {
  return <Tabs defaultActiveKey="1" items={items} />;
}
