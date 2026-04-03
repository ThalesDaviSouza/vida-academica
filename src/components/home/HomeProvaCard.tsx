import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Materia, Prova } from '../../models';
import { colors, radius, spacing } from '../../theme';
import HomeCardBase from './HomeCardBase';
import { formatDateBr, provaTipoLabel } from '../../services/homeService';

type Props = {
  prova: Prova;
  materia?: Materia | null;
  onPress: (prova: Prova) => void;
};

export default function HomeProvaCard({ prova, materia, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(prova)}>
      <HomeCardBase stripeColor={materia?.cor ?? colors.primary}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{provaTipoLabel(prova.tipo)}</Text>
          <Text style={styles.cardSub}>
            Prova  |  {materia ? materia.nome : 'Materia removida'}  |  {formatDateBr(prova.data)}
          </Text>
        </View>
        {prova.peso != null ? (
          <View style={[styles.badge, { backgroundColor: colors.surfaceHigh }]}>
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Peso {prova.peso}</Text>
          </View>
        ) : null}
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
