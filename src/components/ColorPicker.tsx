import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

const CORES = [
  '#7C6FED', '#ED6F6F', '#6FEDAD', '#EDD96F',
  '#6FB5ED', '#ED6FC8', '#ED966F', '#6FEDC8',
];

interface Props {
  value: string;
  onChange: (cor: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label }: Props) {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {CORES.map((cor) => (
          <TouchableOpacity
            key={cor}
            style={[
              styles.cor,
              { backgroundColor: cor },
              value === cor && styles.corSelecionada,
            ]}
            onPress={() => onChange(cor)}
          />
        ))}
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
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  cor: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
  },
  corSelecionada: {
    borderWidth: 3,
    borderColor: '#fff',
  },
});