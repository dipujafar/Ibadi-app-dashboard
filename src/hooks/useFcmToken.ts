"use client";
// import { getToken } from "firebase/messaging";
// import { getFcmMessaging } from "@/lib/firebase/messaging-client";
// import { useEffect, useState } from "react";

// const useFcmToken = () => {
//   const [token, setToken] = useState("");
//   const [notificationPermissionStatus, setNotificationPermissionStatus] =
//     useState("");

//   useEffect(() => {
//     const retrieveToken = async () => {
//       try {
//         if (typeof window !== "undefined" && "serviceWorker" in navigator) {
//           const registration = await navigator.serviceWorker.register(
//             "/firebase-messaging-sw.js"
//           );

//           const messaging = await getFcmMessaging();
//           if (!messaging) return;

//           const permission = await Notification.requestPermission();
//           setNotificationPermissionStatus(permission);

//           if (permission === "granted") {
//             const currentToken = await getToken(messaging, {
//               vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
//               serviceWorkerRegistration: registration,
//             });
          

//             if (currentToken) {
//               setToken(currentToken);
//             } else {
//               console.log("No registration token available. Request permission to generate one.");
//             }
//           }
//         }
//       } catch (error) {
//         console.log("An error occurred while retrieving token:", error);
//       }
//     };

//     retrieveToken();
//   }, []);

//   return { fcmToken: token, notificationPermissionStatus };
// };

// export default useFcmToken;


// hooks/useFcmToken.ts

import { getToken } from "firebase/messaging";
import { getFcmMessaging } from "@/lib/firebase/messaging-client";
import { useEffect, useState } from "react";

const useFcmToken = () => {
  const [token, setToken] = useState("");
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState("");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator)) return;
        if (!("Notification" in window)) return;

        const messaging = await getFcmMessaging();
        if (!messaging) return;

        // 👇 Check current permission BEFORE requesting
        // so we don't re-prompt if already denied
        const currentPermission = Notification.permission;
        setNotificationPermissionStatus(currentPermission);

        if (currentPermission === "denied") return; // let the component handle the toast

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        const permission = await Notification.requestPermission();
        setNotificationPermissionStatus(permission);

        if (permission !== "granted") return;

        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          setToken(currentToken);
        }
      } catch (error) {
        console.log("An error occurred while retrieving token:", error);
      }
    };

    retrieveToken();
  }, []);

  return { fcmToken: token, notificationPermissionStatus };
};

export default useFcmToken;