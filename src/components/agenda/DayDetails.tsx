import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AgendaDayDetails } from '../../models/agenda';
import { colors, radius, spacing } from '../../theme';
import { formatDateBr } from '../../services/agendaService';
import { navigate } from '../../navigation/rootNavigation';

export default function DayDetails({ details }: { details: AgendaDayDetails }) {
  function abrirMateria(materia: any) {
    navigate('Matérias', { screen: 'MateriaDetalhe', params: { materia } });
  }

  function abrirProva(prova: any) {
    navigate('Provas', { openProvaId: prova.id });
  }

  function abrirAtividade(atividade: any) {
    navigate('Atividades', { openAtividadeId: atividade.id });
  }

  return (
    <View style={styles.detail}>
      <Text style={styles.detailTitle}>{formatDateBr(details.iso)}</Text>

      <Text style={styles.sectionTitle}>Matérias</Text>
      {details.aulas.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma aula neste dia</Text>
      ) : (
        <FlatList
          data={details.aulas}
          keyExtractor={(m) => m.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => abrirMateria(item)}
              style={styles.itemRow}
            >
              <View style={[styles.itemDot, { backgroundColor: item.cor }]} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.nome}</Text>
                <Text style={styles.itemSub}>
                  {item.horario}
                  {item.professor ? `  |  ${item.professor}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.sectionTitle}>Provas</Text>
      {details.provas.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma prova neste dia</Text>
      ) : (
        <FlatList
          data={details.provas}
          keyExtractor={(p) => p.prova.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const tipo =
              item.prova.tipo === 'prova'
                ? 'Prova'
                : item.prova.tipo === 'trabalho'
                  ? 'Trabalho'
                  : 'Seminário';
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => abrirProva(item.prova)}
                style={styles.itemRow}
              >
                <View style={[styles.itemDot, { backgroundColor: item.materia?.cor ?? colors.warning }]} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{tipo}</Text>
                  <Text style={styles.itemSub}>{item.materia ? item.materia.nome : 'Matéria removida'}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Text style={styles.sectionTitle}>Atividades</Text>
      {details.atividades.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma atividade pendente neste dia</Text>
      ) : (
        <FlatList
          data={details.atividades}
          keyExtractor={(a) => a.atividade.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => abrirAtividade(item.atividade)}
              style={styles.itemRow}
            >
              <View style={[styles.itemDot, { backgroundColor: item.materia?.cor ?? colors.success }]} />
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.atividade.titulo}</Text>
                <Text style={styles.itemSub}>{item.materia ? item.materia.nome : 'Matéria removida'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  detail: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  detailTitle: {
    color: colors.textPrimary,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '900',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyText: { color: colors.textSecondary, marginBottom: spacing.xs },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  itemDot: { width: 10, height: 10, borderRadius: radius.full },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: { color: colors.textPrimary, fontWeight: '800' },
  itemSub: { color: colors.textSecondary, fontSize: 12 },
});
