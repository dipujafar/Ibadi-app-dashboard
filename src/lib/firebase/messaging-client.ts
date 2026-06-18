"use client";
// lib/firebase/messaging-client.ts
import { firebaseApp } from "@/lib/firebase/firebase";

export async function getFcmMessaging() {
  if (typeof window === "undefined") return null;

  const { getMessaging, isSupported } = await import("firebase/messaging");
  const supported = await isSupported();
  if (!supported) return null;

  return getMessaging(firebaseApp);
}