// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyCsQ39r6-yYumBsxLpirIcjJUwzIpBkdBo",
  authDomain: "service-provider-umi.firebaseapp.com",
  projectId: "service-provider-umi",
  storageBucket: "service-provider-umi.firebasestorage.app",
  messagingSenderId: "102179953373",
  appId: "1:102179953373:web:91f95932433488a1211934",
};
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "./logo.png",
    badge: "./logo.png",
    data: {
      url: payload.data?.url || "/notifications",
    },
    vibrate: [100, 50, 100],
    sound: "default",
    tag: "notification",
    renotify: true,
    requireInteraction: true,
    silent: false,
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Close" },
    ],
    notification: {
      requireInteraction: true,
    },
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
