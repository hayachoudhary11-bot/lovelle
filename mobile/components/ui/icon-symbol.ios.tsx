import type { IconSymbolName } from './icon-symbol';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
  focused = true,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  focused?: boolean;
}) {
  const aliases: Partial<Record<IconSymbolName, string>> = { gallery: 'photo', prompts: 'questionmark.circle', challenges: 'flag', drawing: 'pencil', settings: 'gearshape' };
  const mapped = aliases[name] ?? name;
  const symbolName = (focused ? mapped : mapped.replace('.fill', '')) as SymbolViewProps['name'];

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={symbolName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
