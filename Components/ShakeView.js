import React, { forwardRef, useImperativeHandle } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const tick = (toValue) =>
  withTiming(toValue, { duration: 42, easing: Easing.linear });

const ShakeView = forwardRef(function ShakeView({ children, style }, ref) {
  const translateX = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    shake() {
      translateX.value = withSequence(
        tick(-8),
        tick(8),
        tick(-6),
        tick(6),
        tick(0)
      );
    },
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
});

export default ShakeView;
