import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Animated, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useRef } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type GradientButtonProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function GradientButton({ children, style, ...props }: GradientButtonProps) {
  const colors = Colors[useColorScheme() ?? 'light'];
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 28, bounciness: 4 }).start();
  };

  return (
    <Pressable
      {...props}
      style={style}
      onPressIn={(event) => {
        animateScale(0.97);
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateScale(1);
        props.onPressOut?.(event);
      }}>
      <Animated.View style={[styles.fill, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fill}>
          {children}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = {
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  } satisfies ViewStyle,
};