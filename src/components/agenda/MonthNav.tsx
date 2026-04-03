import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export default function MonthNav({
  title,
  onPrev,
  onNext,
}: {
  title: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.monthRow}>
      <TouchableOpacity style={styles.monthNavBtn} onPress={onPrev} activeOpacity={0.85}>
        <Text style={styles.monthNavText}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.monthTitle}>{title}</Text>
      <TouchableOpacity style={styles.monthNavBtn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.monthNavText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  monthTitle: { color: colors.textPrimary, fontWeight: '900', fontSize: 18 },
  monthNavBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavText: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },
});

