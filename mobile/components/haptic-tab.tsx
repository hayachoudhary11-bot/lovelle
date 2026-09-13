import * as Haptics from 'expo-haptics';
import { Pressable, type PressableProps } from 'react-native';

type HapticTabProps = PressableProps & {
  href?: string;
  children?: React.ReactNode;
};

export function HapticTab(props: HapticTabProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
