"use client";
import { Avatar, Badge, Flex, Skeleton } from "antd";
import { FaBars } from "react-icons/fa6";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "../ui/menubar";
import SmallScreenSidebar from "./SmallScreenSidebar";
import { useGetProfileQuery } from "@/redux/api/profileApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/features/authSlice";
import {
  useGetNotificationQuery,
  useReadNotificationMutation,
} from "@/redux/api/notificationApi";
import { toast } from "sonner";
import { IoNotificationsOutline } from "react-icons/io5";
import { useEffect, useState } from "react";

type TNavbarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const Navbar = ({ collapsed, setCollapsed }: TNavbarProps) => {
  const user: any = useAppSelector((state) => state.auth.user);
  const { data: profileData, isLoading: isProfileDataLoading } =
    useGetProfileQuery(undefined);
  const { data: notificationData } = useGetNotificationQuery(undefined, {
    skip: !user,
  });
  const [readNotification] = useReadNotificationMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState<number>();

  const handleReadNotification = async () => {
    try {
      await readNotification(undefined).unwrap();
      // setUnreadNotificationCount(0);
      router.push("/notifications");
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  useEffect(() => {
    const count = notificationData?.data?.filter(
      (notification: any) => !notification?.isRead,
    ).length;
    setUnreadNotificationCount(count);
  }, [notificationData?.data]);

  return (
    <div className="flex flex-row-reverse xl:flex-row items-center justify-between w-[97%] font-poppins">
      {/* Header left side */}
      <Flex align="center" gap={20}>
        <button
          onClick={() => setCollapsed(collapsed ? false : true)}
          className="cursor-pointer hover:bg-gray-300 rounded-full duration-1000 hidden xl:block"
        >
          {collapsed ? (
            <X size={28} color="#3A3C3B" />
          ) : (
            <FaBars size={28} color="#3A3C3B" />
          )}
        </button>
        <div className="xl:hidden px-2">
          <SmallScreenSidebar />
        </div>
      </Flex>

      {/* Header right side */}
      <Flex align="center" gap={20}>
        {/* Notification */}
        <div onClick={handleReadNotification}>
          <div
           
            className="flex justify-center items-center size-12  rounded-full cursor-pointer relative border border-main-color bg-gray-400"
          >
            <IoNotificationsOutline size={24} color="#fff" />

            <Badge
              count={unreadNotificationCount}
              style={{
                border: "none",
                boxShadow: "none",
                backgroundColor: "var(--color-main)",
                color: "#fff",
                position: "absolute",
                top: "-24px",
                right: "-8px",
              }}
            />
          </div>
        </div>

        <Flex align="center" gap={20}>
          <Menubar className="py-6 rounded-full ">
            <MenubarMenu>
              <MenubarTrigger className="shadow-none px-0 rounded-full py-2">
                <div className="flex items-center gap-x-2  px-2 h-fit">
                  <p className="text-black">
                    {isProfileDataLoading ? (
                      <Skeleton.Input className="!w-[100px] !overflow-hidden" />
                    ) : (
                      profileData?.data?.name?.split(" ")[0]
                    )}
                  </p>
                  {isProfileDataLoading ? (
                    <Skeleton.Avatar size={40} />
                  ) : profileData?.data?.profile ? (
                    <Avatar
                      src={profileData?.data?.profile}
                      size={40}
                      className="size-12"
                    ></Avatar>
                  ) : (
                    <div className="rounded-full size-10 bg-gray-200 flex items-center justify-center text-lg text-black">
                      {profileData?.data?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </MenubarTrigger>

              <MenubarContent className="text-primary-gray">
                <Link href={"/personal-information"}>
                  <MenubarItem className="hover:bg-gray-100 cursor-pointer">
                    Profile{" "}
                    <MenubarShortcut>
                      <ChevronRight size={16} />
                    </MenubarShortcut>
                  </MenubarItem>
                </Link>
                <MenubarSeparator />
                <MenubarItem
                  onClick={() => {
                    dispatch(logout());
                    router.refresh();
                  }}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </Flex>
      </Flex>
    </div>
  );
};

export default Navbar;
