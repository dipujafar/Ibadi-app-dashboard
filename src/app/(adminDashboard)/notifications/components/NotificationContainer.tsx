"use client";;
import moment from "moment";
import { Bell } from "lucide-react";
import { useGetNotificationQuery } from "@/redux/api/notificationApi";
import PaginationSection from "@/components/shared/PaginationSection";
import { useSearchParams } from "next/navigation";
import NotificationContainerSkeleton from "./NotificationContainerSkeleton";



const NotificationContainer = () => {
  const page = useSearchParams().get("page") || 1;
  const limit = useSearchParams().get("limit") || 10;
  const query: Record<string, string | number> = {};
  if (page) query.page = page;
  if (limit) query.limit = limit;
  const { data, isLoading } = useGetNotificationQuery(query);

  if (isLoading) {
    return <NotificationContainerSkeleton />
  }

  return (
    <div>
      <div className="min-h-[80vh]">
        <hr />
        {/* yesterday notification  */}
        <div className="xl:mt-8 mt-6 xl:px-10 px-6 text-text-color">
          {/* showing today notification */}
          <div className="space-y-5">
            {data?.data?.map((notification: any, index: any) => (
              <div className="flex items-center gap-x-4">
                <div className="bg-[#00C0B5] size-10 flex justify-center items-center rounded-full cursor-pointer">
                  <Bell color="white" />
                </div>
                <div
                  key={index}
                  className="bg-white border border-gray-400 rounded-lg p-3 flex-1"
                >
                  <div className="flex justify-between gap-x-2 items-center">
                    <h5 className="font-medium text-xl">
                      {notification?.message}
                    </h5>
                    <p>{moment(notification?.createdAt).fromNow()}</p>
                  </div>
                  <p className="text-gray-500">{notification?.description}</p>
                </div>
                {/* delete option */}
                {/* <div className="bg-[#D30000]/30 size-10 flex justify-center items-center rounded-full cursor-pointer">
                  <Trash2 color="#D30000"></Trash2>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* pagination */}
      <PaginationSection total={data?.meta?.total} current={data?.meta?.page} pageSize={Number(limit)} />
    </div>
  );
};

export default NotificationContainer;
