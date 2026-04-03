import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Atividade, Materia } from '../models';
import { useAtividadesStore } from '../store/atividadesStore';
import { useMateriasStore } from '../store/materiasStore';
import { useSemestresStore } from '../store/semestresStore';
import { colors, radius, spacing } from '../theme';
import DatePicker from '../components/DatePicker';
import WeekDaySelector from '../components/WeekDaySelector';
import { useNavigation, useRoute } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';

type FiltroStatus = 'todas' | 'pendente' | 'concluido';

const EMPTY_FORM = {
  titulo: '',
  materiaId: '',
  dataEntrega: '',
  recorrente: false,
  diasSemana: [] as number[],
};

export default function AtividadesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { semestres, semestreAtivo, load: loadSemestres, setAtivo } = useSemestresStore();
  const { materias, load: loadMaterias } = useMateriasStore();
  const {
    atividades,
    load: loadAtividades,
    criar,
    editar,
    toggleStatus,
    deletar,
  } = useAtividadesStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Atividade | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('pendente');
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadSemestres();
  }, []);

  useEffect(() => {
    if (!semestreAtivo) return;
    loadMaterias(semestreAtivo.id);
    loadAtividades(semestreAtivo.id);
  }, [semestreAtivo]);

  useEffect(() => {
    const openId: string | undefined = route.params?.openAtividadeId;
    if (!openId) return;

    const atividade = atividades.find((a) => a.id === openId);
    if (!atividade) return;

    abrirEditar(atividade);
    navigation.setParams({ openAtividadeId: undefined });
  }, [route.params?.openAtividadeId, atividades]);

  const materiasMap = useMemo(
    () => new Map(materias.map((materia) => [materia.id, materia])),
    [materias]
  );

  const atividadesFiltradas = useMemo(() => {
    if (filtroStatus === 'todas') return atividades;
    return atividades.filter((atividade) => atividade.status === filtroStatus);
  }, [atividades, filtroStatus]);

  function abrirCriar() {
    setEditando(null);
    setForm({
      ...EMPTY_FORM,
      materiaId: materias[0]?.id ?? '',
    });
    setModalVisible(true);
  }

  function abrirEditar(atividade: Atividade) {
    setEditando(atividade);
    setForm({
      titulo: atividade.titulo,
      materiaId: atividade.materiaId,
      dataEntrega: atividade.dataEntrega,
      recorrente: atividade.recorrente,
      diasSemana: atividade.regraRecorrencia?.diasSemana ?? [],
    });
    setModalVisible(true);
  }

  function fecharModal() {
    setModalVisible(false);
    setEditando(null);
    setForm(EMPTY_FORM);
  }

  function salvar() {
    if (!semestreAtivo) return;
    if (!form.titulo.trim()) {
      Alert.alert('Atenção', 'Informe o título da atividade.');
      return;
    }
    if (!form.materiaId) {
      Alert.alert('Atenção', 'Selecione uma matéria.');
      return;
    }
    if (!form.dataEntrega) {
      Alert.alert('Atenção', 'Informe a data de entrega.');
      return;
    }
    if (form.recorrente && form.diasSemana.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um dia da recorrência.');
      return;
    }

    const atividadeBase: Omit<Atividade, 'id'> = {
      titulo: form.titulo.trim(),
      materiaId: form.materiaId,
      dataEntrega: form.dataEntrega,
      recorrente: form.recorrente,
      regraRecorrencia: form.recorrente
        ? { tipo: 'semanal', diasSemana: form.diasSemana }
        : undefined,
      status: editando?.status ?? 'pendente',
    };

    if (editando) {
      editar({ ...editando, ...atividadeBase }, semestreAtivo.id);
    } else {
      criar(atividadeBase, semestreAtivo.id);
    }

    fecharModal();
  }

  function confirmarExcluir(atividade: Atividade) {
    if (!semestreAtivo) return;

    Alert.alert(
      'Excluir atividade',
      `Deseja excluir "${atividade.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deletar(atividade.id, semestreAtivo.id),
        },
      ]
    );
  }

  function renderItem({ item }: { item: Atividade }) {
    const materia = materiasMap.get(item.materiaId);
    const concluida = item.status === 'concluido';

    return (
      <View style={styles.card}>
        <View style={[styles.cardStripe, { backgroundColor: materia?.cor ?? colors.primary }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardTitleWrap}>
              <Text style={[styles.cardTitulo, concluida && styles.cardTituloDone]}>
                {item.titulo}
              </Text>
              <Text style={styles.cardSub}>
                {materia ? materia.nome : 'Matéria removida'}
              </Text>
            </View>
            <Switch
              value={concluida}
              onValueChange={() => {
                if (!semestreAtivo) return;
                toggleStatus(item, semestreAtivo.id);
              }}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.cardMeta}>Entrega: {formatarData(item.dataEntrega)}</Text>
          {item.recorrente && (
            <Text style={styles.cardMeta}>
              Recorrente: {formatarDias(item.regraRecorrencia?.diasSemana ?? [])}
            </Text>
          )}

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={() => abrirEditar(item)}>
              <Text style={styles.btnGhostText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={() => confirmarExcluir(item)}>
              <Text style={[styles.btnGhostText, { color: colors.danger }]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Atividades"
        semestres={semestres}
        semestreAtivoId={semestreAtivo?.id}
        onSelectSemestreAtivo={setAtivo}
        rightAction={
          <TouchableOpacity
            style={[styles.btnNovo, (!semestreAtivo || materias.length === 0) && styles.btnNovoDisabled]}
            onPress={abrirCriar}
            disabled={!semestreAtivo || materias.length === 0}
          >
            <Text style={styles.btnNovoText}>+ Nova</Text>
          </TouchableOpacity>
        }
      />

      {!semestreAtivo ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗓️</Text>
          <Text style={styles.emptyText}>Nenhum semestre ativo</Text>
          <Text style={styles.emptySubtext}>
            Defina um semestre ativo antes de cadastrar atividades
          </Text>
        </View>
      ) : materias.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>Cadastre matérias primeiro</Text>
          <Text style={styles.emptySubtext}>
            As atividades precisam estar vinculadas a uma matéria
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.filters}>
            {([
              ['pendente', 'Pendentes'],
              ['concluido', 'Concluídas'],
              ['todas', 'Todas'],
            ] as Array<[FiltroStatus, string]>).map(([value, label]) => {
              const active = filtroStatus === value;

              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFiltroStatus(value)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={atividadesFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyText}>Nenhuma atividade encontrada</Text>
                <Text style={styles.emptySubtext}>
                  Crie sua primeira atividade para este semestre
                </Text>
              </View>
            }
          />
        </>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editando ? 'Editar atividade' : 'Nova atividade'}
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Lista 3 de Cálculo"
                  placeholderTextColor={colors.textMuted}
                  value={form.titulo}
                  onChangeText={(titulo) => setForm((state) => ({ ...state, titulo }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Matéria *</Text>
                <View style={styles.materiasGrid}>
                  {materias.map((materia) => {
                    const selected = form.materiaId === materia.id;

                    return (
                      <TouchableOpacity
                        key={materia.id}
                        onPress={() =>
                          setForm((state) => ({ ...state, materiaId: materia.id }))
                        }
                        style={[
                          styles.materiaChip,
                          selected && {
                            borderColor: materia.cor,
                            backgroundColor: colors.surfaceHigh,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.materiaDot,
                            { backgroundColor: materia.cor },
                          ]}
                        />
                        <Text
                          style={[
                            styles.materiaChipText,
                            selected && styles.materiaChipTextActive,
                          ]}
                        >
                          {materia.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <DatePicker
                  label="Data de entrega *"
                  value={form.dataEntrega}
                  onChange={(dataEntrega) =>
                    setForm((state) => ({ ...state, dataEntrega }))
                  }
                />
              </View>

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.label}>Atividade recorrente</Text>
                  <Text style={styles.switchHint}>
                    Use para marcar tarefas semanais que se repetem
                  </Text>
                </View>
                <Switch
                  value={form.recorrente}
                  onValueChange={(recorrente) =>
                    setForm((state) => ({
                      ...state,
                      recorrente,
                      diasSemana: recorrente ? state.diasSemana : [],
                    }))
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {form.recorrente && (
                <View style={styles.fieldGroup}>
                  <WeekDaySelector
                    label="Dias da recorrência *"
                    value={form.diasSemana}
                    onChange={(diasSemana) =>
                      setForm((state) => ({ ...state, diasSemana }))
                    }
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancelar} onPress={fecharModal}>
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
                  <Text style={styles.btnSalvarText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDias(dias: number[]) {
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  return dias.map((dia) => nomes[dia]).join(', ');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  btnNovo: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  btnNovoDisabled: { backgroundColor: colors.border },
  btnNovoText: { color: '#fff', fontWeight: '600' },

  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },

  list: { padding: spacing.md, gap: spacing.sm },
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitleWrap: { flex: 1, gap: 2 },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardTituloDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  cardSub: { fontSize: 13, color: colors.textSecondary },
  cardMeta: { fontSize: 13, color: colors.textSecondary },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  btnGhost: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHigh,
  },
  btnGhostText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },

  empty: { alignItems: 'center', paddingTop: spacing.xl * 2, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '92%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  fieldGroup: { marginBottom: spacing.md },
  label: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  materiasGrid: {
    gap: spacing.sm,
  },
  materiaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  materiaDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  materiaChipText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  materiaChipTextActive: {
    color: colors.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  switchHint: {
    color: colors.textMuted,
    fontSize: 12,
    maxWidth: 240,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  btnCancelar: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnCancelarText: { color: colors.textSecondary, fontWeight: '600' },
  btnSalvar: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  btnSalvarText: { color: '#fff', fontWeight: '600' },
});
