import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DIAS_FULL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  value: number[];
  onChange: (dias: number[]) => void;
  label?: string;
}

export default function WeekDaySelector({ value, onChange, label }: Props) {
  function toggle(dia: number) {
    if (value.includes(dia)) {
      onChange(value.filter((d) => d !== dia));
    } else {
      onChange([...value, dia].sort());
    }
  }

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {DIAS.map((_, i) => {
          const ativo = value.includes(i);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dia, ativo && styles.diaAtivo]}
              onPress={() => toggle(i)}
            >
              <Text style={[styles.diaText, ativo && styles.diaTextAtivo]}>
                {DIAS_FULL[i]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dia: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  diaAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  diaTextAtivo: {
    color: '#fff',
  },
});