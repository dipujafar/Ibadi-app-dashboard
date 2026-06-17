"use client";
// import useFcmToken from "@/hooks/useFcmToken";
// import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/api/userApi";
import { tagTypes } from "@/redux/tagTypes";
import { getMessaging, onMessage } from "firebase/messaging";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { firebaseApp } from "../firebase/firebase";
import { useAppDispatch } from "@/redux/hooks";
import CustomToast from "@/components/shared/CustomToast";
import notificationApi from "@/redux/api/notificationApi";
const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
    //   const [updateProfile] = useUpdateProfileMutation({});
    //   const { data, isLoading } = useGetProfileQuery([]);
    const dispatch = useAppDispatch();
    //   const user = data?.data as any;
    //   const { fcmToken, notificationPermissionStatus } = useFcmToken();
    //   useEffect(() => {
    //     if (fcmToken && notificationPermissionStatus === "granted" && !isLoading && !user?.fcmToken) {
    //       const formData = new FormData();

    //       const data = {
    //         fcmToken: fcmToken,
    //       };
    //       dispatch(
    //         notificationApi.util.invalidateTags([tagTypes.notifications, tagTypes.notifications]),
    //       );
    //       formData.append("data", JSON.stringify(data));
    //       //updateProfile(formData);
    //     }
    //   }, [fcmToken, notificationPermissionStatus, updateProfile, isLoading, user]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const messaging = getMessaging(firebaseApp);
            const unsubscribe = onMessage(messaging, (payload) => {
                if (payload.notification?.title && payload.notification?.body) {
                    dispatch(
                        notificationApi.util.invalidateTags([tagTypes.notifications, tagTypes.notifications]),
                    );
                    toast.custom(
                        (t) => (
                            <CustomToast title={payload.notification?.title} body={payload.notification?.body} />
                        ),
                        {
                            position: "bottom-left",
                        },
                    );
                }
            });
            return () => {
                unsubscribe();
            };
        }
    }, []);

    return <>{children}</>;
};

export default FirebaseProvider;
