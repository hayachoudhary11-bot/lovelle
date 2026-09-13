/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#d93688';
const tintColorDark = '#ff6bb5';
const loveAccentLight = '#e83e8c';
const loveAccentDark = '#ff5ba8';

export const Colors = {
  light: {
    text: '#302443',
    background: '#f4efff',
    tint: tintColorLight,
    icon: '#84759d',
    tabIconDefault: '#84759d',
    tabIconSelected: tintColorLight,
    loveAccent: loveAccentLight,
    accentOn: '#fff8fc',
    surface: '#fcfaff',
    border: '#dfd1f1',
    muted: '#766889',
    accentSoft: '#d9c5f4',
    gradientStart: '#5b2a86',
    gradientEnd: loveAccentLight,
    homeBackground: '#fff7fb',
    homeSurface: '#fff1f7',
    homeCard: '#fff8fc',
    homeBorder: '#f3d6e4',
    homeText: '#302443',
    homeMuted: '#9a7185',
  },
  dark: {
    text: '#f7efff',
    background: '#130d22',
    tint: '#e95bb5',
    icon: '#d8a4bc',
    tabIconDefault: '#b986a2',
    tabIconSelected: '#f08ad0',
    loveAccent: '#e85aa9',
    accentOn: '#2d1730',
    surface: '#26172f',
    border: '#5c365f',
    muted: '#d0b2d1',
    accentSoft: '#4b2850',
    gradientStart: '#64266f',
    gradientEnd: '#e85aa9',
    homeBackground: '#1f1025',
    homeSurface: '#301934',
    homeCard: '#422044',
    homeBorder: '#693b69',
    homeText: '#fff1f7',
    homeMuted: '#d4b1d0',
  },
};

export const Layout = {
  radius: 18,
  smallRadius: 14,
  screenPadding: 24,
  shadow: {
    shadowColor: '#2e2050',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
