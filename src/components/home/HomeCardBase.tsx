import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

type Props = {
  stripeColor: string;
  children: ReactNode;
};

export default function HomeCardBase({ stripeColor, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardStripe, { backgroundColor: stripeColor }]} />
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardStripe: { width: 5 },
  cardBody: { flex: 1, padding: spacing.md, gap: spacing.xs },
});

