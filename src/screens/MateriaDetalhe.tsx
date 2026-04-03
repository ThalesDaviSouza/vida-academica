import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MateriasStackParamList } from '../navigation/MateriasNavigator';
import { usePresencasStore } from '../store/presencasStore';
import { useSemestresStore } from '../store/semestresStore';
import { Presenca } from '../models';
import { gerarTodasAulas, FrequenciaStats } from '../services/presencaService';
import { colors, spacing, radius } from '../theme';

type Props = NativeStackScreenProps<MateriasStackParamList, 'MateriaDetalhe'>;

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface AulaItem {
  data: string;
  presenca: Presenca | null;
  passada: boolean;
}

export default function MateriaDetalheScreen({ route, navigation }: Props) {
  const { materia } = route.params;
  const { semestreAtivo } = useSemestresStore();
  const { presencas, stats, load, toggleStatus, toggleCancelada } = usePresencasStore();

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (semestreAtivo) load(materia.id, materia, semestreAtivo.dataInicio);
  }, [materia.id]);

  if (!semestreAtivo) return null;

  const presencasMap = new Map(presencas.map((p) => [p.data, p]));
  const todasDatas = gerarTodasAulas(materia, semestreAtivo.dataInicio);
  const aulas: AulaItem[] = todasDatas.map((data) => ({
    data,
    presenca: presencasMap.get(data) ?? null,
    passada: data <= hoje,
  }));

  function handleTap(item: AulaItem) {
    if (!item.passada || !item.presenca) return;
    if (item.presenca.status === 'cancelada') return;
    toggleStatus(item.presenca, materia, semestreAtivo!.dataInicio);
  }

  function handleLongPress(item: AulaItem) {
    if (!item.passada) return;
    const isCancelada = item.presenca?.status === 'cancelada';
    Alert.alert(
      isCancelada ? 'Reativar aula' : 'Cancelar aula',
      isCancelada
        ? 'Deseja reativar esta aula? Ela voltará a contar na frequência.'
        : 'Deseja marcar esta aula como cancelada? Ela não contará na frequência.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: isCancelada ? 'Reativar' : 'Cancelar aula',
          style: isCancelada ? 'default' : 'destructive',
          onPress: () =>
            toggleCancelada(materia.id, item.data, materia, semestreAtivo!.dataInicio),
        },
      ]
    );
  }

  function getStatusStyle(item: AulaItem): { label: string; color: string; bg: string } {
    if (!item.passada) {
      return { label: 'Futura', color: colors.textMuted, bg: colors.surfaceHigh };
    }
    switch (item.presenca?.status) {
      case 'falta':
        return { label: 'Falta', color: colors.danger, bg: colors.danger + '22' };
      case 'cancelada':
        return { label: 'Cancelada', color: colors.textMuted, bg: colors.surfaceHigh };
      default:
        return { label: 'Presente', color: colors.success, bg: colors.success + '22' };
    }
  }

  function renderItem({ item }: { item: AulaItem }) {
    const s = getStatusStyle(item);
    const [ano, mes, dia] = item.data.split('-');
    const diaSemana = DIAS[new Date(`${item.data}T12:00:00`).getDay()];

    return (
      <TouchableOpacity
        style={[styles.aulaCard, !item.passada && styles.aulaFutura]}
        onPress={() => handleTap(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={item.passada ? 0.7 : 1}
      >
        <View style={[styles.aulaStripe, { backgroundColor: materia.cor }]} />
        <View style={styles.aulaInfo}>
          <Text style={styles.aulaData}>{dia}/{mes}/{ano}</Text>
          <Text style={styles.aulaDiaSemana}>{diaSemana}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: materia.cor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{materia.nome}</Text>
        {materia.professor && (
          <Text style={styles.headerSub}>👤 {materia.professor}</Text>
        )}
      </View>

      {/* Risco */}
      {stats?.emRisco && (
        <View style={styles.riskBanner}>
          <Text style={styles.riskText}>
            ⚠️ Você atingiu {Math.round(stats.percentualFaltas * 100)}% de faltas! Limite máximo: 30%
          </Text>
        </View>
      )}

      {/* Stats */}
      {stats && <StatsCard stats={stats} cor={materia.cor} />}

      {/* Hint */}
      <Text style={styles.hint}>
        Toque para alternar presença/falta • Segure para cancelar aula
      </Text>

      {/* Lista */}
      <FlatList
        data={aulas}
        keyExtractor={(item) => item.data}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

function StatsCard({ stats, cor }: { stats: FrequenciaStats; cor: string }) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.presencas}</Text>
          <Text style={styles.statLabel}>Presenças</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.danger }]}>{stats.faltas}</Text>
          <Text style={styles.statLabel}>Faltas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[
            styles.statValue,
            { color: stats.emRisco ? colors.danger : colors.success }
          ]}>
            {Math.round(stats.percentual * 100)}%
          </Text>
          <Text style={styles.statLabel}>Frequência</Text>
        </View>
      </View>

      {/* Barra de progresso */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, {
          width: `${Math.min(stats.percentual * 100, 100)}%` as any,
          backgroundColor: stats.emRisco ? colors.danger : cor,
        }]} />
        <View style={styles.limiteLine} />
      </View>
      <Text style={styles.progressLabel}>
        Mínimo de frequência: 70%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    gap: spacing.xs,
  },
  backBtn: { color: colors.primary, fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  headerSub: { fontSize: 13, color: colors.textSecondary },

  riskBanner: {
    backgroundColor: colors.danger + '22',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: radius.sm,
  },
  riskText: { color: colors.danger, fontWeight: '600', fontSize: 13 },

  statsContainer: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  progressBg: {
    height: 8,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  limiteLine: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.warning,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },

  hint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },

  list: { padding: spacing.md, gap: spacing.sm },

  aulaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  aulaFutura: { opacity: 0.5 },
  aulaStripe: { width: 4, alignSelf: 'stretch' },
  aulaInfo: { flex: 1, padding: spacing.md, gap: 2 },
  aulaData: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  aulaDiaSemana: { fontSize: 12, color: colors.textSecondary },
  statusBadge: {
    margin: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    minWidth: 76,
    alignItems: 'center',
  },
  statusText: { fontSize: 12, fontWeight: '700' },
});