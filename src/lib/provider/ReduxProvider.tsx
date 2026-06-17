"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/redux/store";
import SocketProvider from "@/context/SocketContextApi";
import FirebaseProvider from "./FirebaseProvider";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <FirebaseProvider>
          <SocketProvider>{children}</SocketProvider>
        </FirebaseProvider>
      </PersistGate>
    </Provider>
  );
}
