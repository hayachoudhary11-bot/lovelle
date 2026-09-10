import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
  focused = true,
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  focused?: boolean;
}) {
  const symbolName = focused ? name : name.replace('.fill', '') as SymbolViewProps['name'];

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
