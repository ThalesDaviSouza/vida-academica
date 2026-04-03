import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
};

export default function HomeSection({ title, subtitle, collapsible, collapsed, onToggle }: Props) {
  const content = (
    <>
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {collapsible ? (
          <Text style={styles.chevron}>{collapsed ? '▸' : '▾'}</Text>
        ) : null}
      </View>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
    </>
  );

  if (!collapsible) {
    return <View style={styles.section}>{content}</View>;
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.section}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  sectionSub: { color: colors.textSecondary, marginTop: 2 },
  chevron: { color: colors.textMuted, fontWeight: '900', fontSize: 36 },
});
