import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from '../components/DatePicker';
import { Materia, Prova } from '../models';
import { useMateriasStore } from '../store/materiasStore';
import { useProvasStore } from '../store/provasStore';
import { useSemestresStore } from '../store/semestresStore';
import { colors, radius, spacing } from '../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';

type Filtro = 'todas' | 'proximas';

const TIPOS: Array<Prova['tipo']> = ['prova', 'trabalho', 'seminario'];
const TIPOS_LABEL: Record<Prova['tipo'], string> = {
  prova: 'Prova',
  trabalho: 'Trabalho',
  seminario: 'Seminário',
};

const EMPTY_FORM = {
  materiaId: '',
  data: '',
  tipo: 'prova' as Prova['tipo'],
  peso: '',
};

export default function ProvasScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { semestres, semestreAtivo, load: loadSemestres, setAtivo } = useSemestresStore();
  const { materias, load: loadMaterias } = useMateriasStore();
  const { provas, load, criar, editar, deletar } = useProvasStore();

  const [filtro, setFiltro] = useState<Filtro>('proximas');
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Prova | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadSemestres();
  }, []);

  useEffect(() => {
    if (!semestreAtivo) return;
    loadMaterias(semestreAtivo.id);
    load(semestreAtivo.id);
  }, [semestreAtivo]);

  useEffect(() => {
    const openId: string | undefined = route.params?.openProvaId;
    if (!openId) return;

    const prova = provas.find((p) => p.id === openId);
    if (!prova) return;

    abrirEditar(prova);
    navigation.setParams({ openProvaId: undefined });
  }, [route.params?.openProvaId, provas]);

  const materiasMap = useMemo(
    () => new Map(materias.map((materia) => [materia.id, materia])),
    [materias]
  );

  const provasFiltradas = useMemo(() => {
    if (filtro === 'todas') return provas;
    const hoje = new Date().toISOString().split('T')[0];
    const limite = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    return provas.filter((p) => p.data >= hoje && p.data <= limite);
  }, [provas, filtro]);

  function abrirCriar() {
    setEditando(null);
    setForm({
      ...EMPTY_FORM,
      materiaId: materias[0]?.id ?? '',
    });
    setModalVisible(true);
  }

  function abrirEditar(p: Prova) {
    setEditando(p);
    setForm({
      materiaId: p.materiaId,
      data: p.data,
      tipo: p.tipo,
      peso: p.peso != null ? String(p.peso) : '',
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
    if (!form.materiaId) {
      Alert.alert('Atenção', 'Selecione uma matéria.');
      return;
    }
    if (!form.data) {
      Alert.alert('Atenção', 'Informe a data.');
      return;
    }

    let peso: number | undefined = undefined;
    if (form.peso.trim()) {
      const parsed = Number(form.peso.replace(',', '.'));
      if (Number.isNaN(parsed) || parsed <= 0) {
        Alert.alert('Atenção', 'Informe um peso válido (ex: 1, 2.5).');
        return;
      }
      peso = parsed;
    }

    const dados: Omit<Prova, 'id'> = {
      materiaId: form.materiaId,
      data: form.data,
      tipo: form.tipo,
      peso,
    };

    if (editando) {
      editar({ ...editando, ...dados }, semestreAtivo.id);
    } else {
      criar(dados, semestreAtivo.id);
    }

    fecharModal();
  }

  function confirmarExcluir(p: Prova) {
    if (!semestreAtivo) return;

    Alert.alert(
      'Excluir prova',
      `Deseja excluir este item de ${TIPOS_LABEL[p.tipo]}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deletar(p.id, semestreAtivo.id),
        },
      ]
    );
  }

  function renderItem({ item }: { item: Prova }) {
    const materia = materiasMap.get(item.materiaId);
    const cor = materia?.cor ?? colors.primary;

    return (
      <View style={styles.card}>
        <View style={[styles.cardStripe, { backgroundColor: cor }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitulo}>{TIPOS_LABEL[item.tipo]}</Text>
              <Text style={styles.cardSub}>{materia ? materia.nome : 'Matéria removida'}</Text>
            </View>
            <Text style={styles.cardDate}>{formatarData(item.data)}</Text>
          </View>

          {item.peso != null && (
            <Text style={styles.cardMeta}>Peso: {String(item.peso)}</Text>
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
        title="Provas"
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
          <Text style={styles.emptySubtext}>Defina um semestre ativo antes de cadastrar provas</Text>
        </View>
      ) : materias.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>Cadastre matérias primeiro</Text>
          <Text style={styles.emptySubtext}>As provas precisam estar vinculadas a uma matéria</Text>
        </View>
      ) : (
        <>
          <View style={styles.filters}>
            {([
              ['proximas', 'Próximas (7d)'],
              ['todas', 'Todas'],
            ] as Array<[Filtro, string]>).map(([value, label]) => {
              const active = filtro === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFiltro(value)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={provasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>Nenhuma prova encontrada</Text>
                <Text style={styles.emptySubtext}>Cadastre sua primeira prova neste semestre</Text>
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
                {editando ? 'Editar prova' : 'Nova prova'}
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Matéria *</Text>
                <View style={styles.materiasGrid}>
                  {materias.map((materia: Materia) => {
                    const selected = form.materiaId === materia.id;

                    return (
                      <TouchableOpacity
                        key={materia.id}
                        onPress={() => setForm((state) => ({ ...state, materiaId: materia.id }))}
                        style={[
                          styles.materiaChip,
                          selected && { borderColor: materia.cor, backgroundColor: colors.surfaceHigh },
                        ]}
                      >
                        <View style={[styles.materiaDot, { backgroundColor: materia.cor }]} />
                        <Text style={styles.materiaChipText}>{materia.nome}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <DatePicker
                  label="Data *"
                  value={form.data}
                  onChange={(data) => setForm((state) => ({ ...state, data }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Tipo *</Text>
                <View style={styles.tipoRow}>
                  {TIPOS.map((tipo) => {
                    const selected = form.tipo === tipo;
                    return (
                      <TouchableOpacity
                        key={tipo}
                        onPress={() => setForm((state) => ({ ...state, tipo }))}
                        style={[styles.tipoChip, selected && styles.tipoChipActive]}
                      >
                        <Text style={[styles.tipoChipText, selected && styles.tipoChipTextActive]}>
                          {TIPOS_LABEL[tipo]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Peso (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 2"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={form.peso}
                  onChangeText={(peso) => setForm((state) => ({ ...state, peso }))}
                />
              </View>

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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitleWrap: { flex: 1, gap: 2 },
  cardTitulo: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: 13, color: colors.textSecondary },
  cardDate: { color: colors.textPrimary, fontWeight: '700' },
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
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },

  materiasGrid: { gap: spacing.sm },
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

  tipoRow: { flexDirection: 'row', gap: spacing.sm },
  tipoChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tipoChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tipoChipText: { color: colors.textSecondary, fontWeight: '700' },
  tipoChipTextActive: { color: '#fff' },

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
