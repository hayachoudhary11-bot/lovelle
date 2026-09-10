import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function EmptyState({ message }: { message: string }) {
  const colors = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
        <IconSymbol name="heart" size={28} color={colors.loveAccent} />
      </View>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  iconCircle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  message: { fontSize: 15, lineHeight: 21, textAlign: 'center', fontWeight: '600' },
});