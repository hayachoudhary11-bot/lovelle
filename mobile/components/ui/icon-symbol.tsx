// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  fingerprint: 'fingerprint', gamepad: 'sports-esports', flame: 'local-fire-department', 'list.bullet': 'format-list-bulleted', location: 'location-on', 'battery.full': 'battery-full',

  'house.fill': 'home',
  'message.fill': 'chat',
  'paperplane.fill': 'send',
  checklist: 'checklist',
  calendar: 'calendar-today',
  gallery: 'photo-library',
  prompts: 'question-mark',
  challenges: 'sports-score',
  drawing: 'edit',
  settings: 'settings',
  heart: 'favorite',
  photo: 'photo-library',
  pencil: 'edit',
  'questionmark.circle': 'help-outline',
  flag: 'sports-score',
  gearshape: 'settings',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as const satisfies IconMapping;

const OUTLINE_MAPPING: Partial<Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']>> = {
  'house.fill': 'home',
  'message.fill': 'chat-bubble-outline',
  'paperplane.fill': 'send',
  checklist: 'checklist',
  calendar: 'calendar-today',
  gallery: 'photo-library',
  prompts: 'help-outline',
  challenges: 'sports-score',
  drawing: 'edit',
  settings: 'settings',
  heart: 'favorite-border',
  photo: 'photo-library',
  pencil: 'edit',
  'questionmark.circle': 'help-outline',
  flag: 'sports-score',
  gearshape: 'settings',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  focused = true,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
  focused?: boolean;
}) {
  return <MaterialIcons color={color} size={size} name={(focused ? MAPPING[name] : OUTLINE_MAPPING[name]) ?? MAPPING[name]} style={style} />;
}
