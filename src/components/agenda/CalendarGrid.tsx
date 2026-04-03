import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AgendaCalendarCell } from '../../models/agenda';
import { colors, radius, spacing } from '../../theme';
import { WEEKDAYS } from '../../services/agendaService';

function CalendarGrid({
  cells,
  onSelectDay,
}: {
  cells: AgendaCalendarCell[];
  onSelectDay: (iso: string) => void;
}) {
  return (
    <View>
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const dimmed = !cell.inMonth;
          return (
            <Pressable
              key={cell.iso}
              onPress={() => onSelectDay(cell.iso)}
              style={[
                styles.dayCell,
                cell.selected && styles.dayCellSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  dimmed && styles.dayNumberDim,
                  cell.selected && styles.dayNumberSelected,
                ]}
              >
                {cell.day}
              </Text>
              <View style={styles.dots}>
                {cell.dots.map((c, idx) => (
                  <View key={`${cell.iso}-${idx}`} style={[styles.dot, { backgroundColor: c }]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default memo(CalendarGrid);

const styles = StyleSheet.create({
  weekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  dayCell: {
    width: '13.5%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  dayCellSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceHigh,
  },
  dayNumber: { color: colors.textPrimary, fontWeight: '800' },
  dayNumberSelected: { color: colors.primaryLight },
  dayNumberDim: { color: colors.textMuted },
  dots: { flexDirection: 'row', gap: 3, height: 6 },
  dot: { width: 6, height: 6, borderRadius: radius.full },
});

