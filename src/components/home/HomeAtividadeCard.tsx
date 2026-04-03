import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Atividade, Materia } from '../../models';
import { colors, radius, spacing } from '../../theme';
import HomeCardBase from './HomeCardBase';
import { formatDateBr } from '../../services/homeService';

type Props = {
  atividade: Atividade;
  materia?: Materia | null;
  dataSelecionadaIso: string;
  onPress: (atividade: Atividade) => void;
};

export default function HomeAtividadeCard({ atividade, materia, dataSelecionadaIso, onPress }: Props) {
  const overdue = atividade.dataEntrega < dataSelecionadaIso;
  const dueToday = atividade.dataEntrega === dataSelecionadaIso;
  const label = overdue ? 'Atrasada' : dueToday ? 'Hoje' : 'Pendente';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(atividade)}>
      <HomeCardBase stripeColor={materia?.cor ?? colors.primary}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{atividade.titulo}</Text>
          <Text style={styles.cardSub}>
            Atividade  |  {materia ? materia.nome : 'Materia removida'}  |  Entrega: {formatDateBr(atividade.dataEntrega)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: overdue ? colors.danger + '22' : colors.surfaceHigh }]}>
          <Text style={[styles.badgeText, { color: overdue ? colors.danger : colors.textSecondary }]}>
            {label}
          </Text>
        </View>
      </View>
      </HomeCardBase>
    </TouchableOpacity>
  );
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
});
