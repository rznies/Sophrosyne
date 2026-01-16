import { NativeModules, NativeEventEmitter } from "react-native";
import { useEffect } from "react";

export const IntentGateNative = NativeModules.IntentGateModule;

// Event emitter for listening to native events
const eventEmitter = new NativeEventEmitter(IntentGateNative);

export interface IntentGateEvents {
  onIntercept: { packageName: string; displayName: string };
  onSessionStart: { packageName: string };
  onSessionEnd: { packageName: string; outcome: string };
}

export const addIntentGateEventListener = (
  eventName: keyof IntentGateEvents,
  callback: (event: any) => void
) => {
  return eventEmitter.addListener(eventName, callback);
};

// Type-safe event subscription hook
export function useIntentGateEvents() {
  useEffect(() => {
    const interceptSubscription = addIntentGateEventListener(
      "onIntercept",
      (event) => {
        console.log("Gate intercept:", event);
        // Handle intercept event (show gate overlay)
      }
    );

    return () => {
      interceptSubscription.remove();
    };
  }, []);
}
