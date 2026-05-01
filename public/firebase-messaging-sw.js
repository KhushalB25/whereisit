// Firebase Cloud Messaging Service Worker
// Replace the placeholder values below with your actual Firebase config
// or generate this file at build time from your environment variables.

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { notification, data } = payload;
  const title = notification?.title || "WhereIsIt";
  const body = notification?.body || "";
  const icon = notification?.icon || "/favicon.ico";

  self.registration.showNotification(title, {
    body,
    icon,
    badge: "/favicon.ico",
    data: data || {},
    vibrate: [200, 100, 200],
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
