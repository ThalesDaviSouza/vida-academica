import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Materia, Presenca } from '../../models';
import { colors, radius, spacing } from '../../theme';
import HomeCardBase from './HomeCardBase';
import { todayIso } from '../../services/homeService';

type Props = {
  materia: Materia;
  dataIso: string;
  presenca?: Presenca | null;
  onToggleFalta: (materia: Materia, dataIso: string) => void;
  onPress: (materia: Materia) => void;
};

export default function HomeAulaCard({ materia, dataIso, presenca, onToggleFalta, onPress }: Props) {
  const hoje = todayIso();
  const isFuture = dataIso > hoje;

  const status: Presenca['status'] | 'futura' =
    presenca?.status ?? (isFuture ? 'futura' : 'auto_presente');

  const badge = getBadge(status);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(materia)}>
      <HomeCardBase stripeColor={materia.cor}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{materia.nome}</Text>
          <Text style={styles.cardSub}>
            {materia.horario}
            {materia.professor ? `  |  ${materia.professor}` : ''}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.btn, isFuture && styles.btnDisabled]}
          onPress={() => onToggleFalta(materia, dataIso)}
          disabled={isFuture}
        >
          <Text style={styles.btnText}>
            {status === 'falta' ? 'Marcar presente' : 'Marcar falta'}
          </Text>
        </TouchableOpacity>
      </View>
      </HomeCardBase>
    </TouchableOpacity>
  );
}

function getBadge(status: Presenca['status'] | 'futura'): { label: string; color: string; bg: string } {
  switch (status) {
    case 'falta':
      return { label: 'Falta', color: colors.danger, bg: colors.danger + '22' };
    case 'presente':
      return { label: 'Presente', color: colors.success, bg: colors.success + '22' };
    case 'auto_presente':
      return { label: 'Auto', color: colors.textSecondary, bg: colors.surfaceHigh };
    case 'cancelada':
      return { label: 'Cancelada', color: colors.textMuted, bg: colors.surfaceHigh };
    case 'futura':
    default:
      return { label: 'Futura', color: colors.textMuted, bg: colors.surfaceHigh };
  }
}

const styles = StyleSheet.create({
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitleWrap: { flex: 1, gap: 2 },
  cardTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  cardSub: { color: colors.textSecondary, fontSize: 13 },

  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { fontWeight: '800', fontSize: 12 },

  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xs },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  btnDisabled: { backgroundColor: colors.border },
  btnText: { color: '#fff', fontWeight: '700' },
});
