import { withSequence, withTiming } from "react-native-reanimated";

/** Short horizontal shake for invalid form fields. */
export function triggerShake(sharedValue) {
  sharedValue.value = withSequence(
    withTiming(-8, { duration: 40 }),
    withTiming(8, { duration: 40 }),
    withTiming(-6, { duration: 40 }),
    withTiming(6, { duration: 40 }),
    withTiming(0, { duration: 45 })
  );
}
