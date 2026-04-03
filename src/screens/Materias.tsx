import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useMateriasStore } from '../store/materiasStore';
import { useSemestresStore } from '../store/semestresStore';
import { Materia } from '../models';
import { colors, spacing, radius } from '../theme';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import WeekDaySelector from '../components/WeekDaySelector';
import ColorPicker from '../components/ColorPicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MateriasStackParamList } from '../navigation/MateriasNavigator';
import PageHeader from '../components/PageHeader';

type MateriasNavProp = NativeStackNavigationProp<MateriasStackParamList, 'MateriasList'>;

const EMPTY_FORM = {
  nome: '',
  professor: '',
  cor: '#7C6FED',
  diasSemana: [] as number[],
  horario: '',
  dataFim: '',
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function MateriasScreen() {
  const { materias, load, criar, editar, deletar } = useMateriasStore();
  const { semestres, semestreAtivo, load: loadSemestres, setAtivo } = useSemestresStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  
  useEffect(() => {
    loadSemestres();
  }, []);

  useEffect(() => {
    if (semestreAtivo) load(semestreAtivo.id);
  }, [semestreAtivo]);

  const navigation = useNavigation<MateriasNavProp>();

  function abrirCriar() {
    setEditando(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function abrirEditar(m: Materia) {
    setEditando(m);
    setForm({
      nome: m.nome,
      professor: m.professor ?? '',
      cor: m.cor,
      diasSemana: m.diasSemana,
      horario: m.horario,
      dataFim: m.dataFim,
    });
    setModalVisible(true);
  }

  function salvar() {
    if (!form.nome.trim()) {
      Alert.alert('Atenção', 'O nome da matéria é obrigatório.');
      return;
    }
    if (form.diasSemana.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um dia da semana.');
      return;
    }
    if (!form.horario) {
      Alert.alert('Atenção', 'Informe o horário da aula.');
      return;
    }
    if (!semestreAtivo) return;

    const dados = {
      nome: form.nome.trim(),
      professor: form.professor.trim() || undefined,
      cor: form.cor,
      diasSemana: form.diasSemana,
      horario: form.horario,
      // Opcional: se não informar, assume o fim do semestre ativo.
      dataFim: form.dataFim || semestreAtivo.dataFim,
      semestreId: semestreAtivo.id,
    };

    if (editando) {
      editar({ ...editando, ...dados });
    } else {
      criar(dados);
    }
    setModalVisible(false);
  }

  function confirmarDeletar(m: Materia) {
    Alert.alert(
      'Excluir matéria',
      `Deseja excluir "${m.nome}"? Todas as presenças e atividades serão removidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deletar(m.id) },
      ]
    );
  }

  function renderItem({ item }: { item: Materia }) {
    const diasLabel = item.diasSemana.map((d) => DIAS_SEMANA[d]).join(', ');
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MateriaDetalhe', { materia: item })}
        activeOpacity={0.8}
      >
        <View style={[styles.cardStripe, { backgroundColor: item.cor }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardNome}>{item.nome}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.btnIcon} onPress={() => abrirEditar(item)}>
                <Text style={styles.btnIconText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnIcon} onPress={() => confirmarDeletar(item)}>
                <Text style={styles.btnIconText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
          {item.professor && (
            <Text style={styles.cardSub}>👤 {item.professor}</Text>
          )}
          <Text style={styles.cardSub}>📅 {diasLabel} • {item.horario}</Text>
          <Text style={styles.cardSub}>🏁 Até {formatarData(item.dataFim)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Matérias"
        semestres={semestres}
        semestreAtivoId={semestreAtivo?.id}
        onSelectSemestreAtivo={setAtivo}
        rightAction={
          <TouchableOpacity
            style={[styles.btnNovo, !semestreAtivo && styles.btnNovoDisabled]}
            onPress={abrirCriar}
            disabled={!semestreAtivo}
          >
            <Text style={styles.btnNovoText}>+ Nova</Text>
          </TouchableOpacity>
        }
      />

      {!semestreAtivo ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗓️</Text>
          <Text style={styles.emptyText}>Nenhum semestre ativo</Text>
          <Text style={styles.emptySubtext}>Defina um semestre ativo na aba Semestres</Text>
        </View>
      ) : (
        <FlatList
          data={materias}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>Nenhuma matéria cadastrada</Text>
              <Text style={styles.emptySubtext}>Adicione sua primeira matéria</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editando ? 'Editar matéria' : 'Nova matéria'}
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Cálculo I"
                  placeholderTextColor={colors.textMuted}
                  value={form.nome}
                  onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Professor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Prof. João Silva"
                  placeholderTextColor={colors.textMuted}
                  value={form.professor}
                  onChangeText={(v) => setForm((f) => ({ ...f, professor: v }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ColorPicker
                  label="Cor da matéria"
                  value={form.cor}
                  onChange={(v) => setForm((f) => ({ ...f, cor: v }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <WeekDaySelector
                  label="Dias da semana *"
                  value={form.diasSemana}
                  onChange={(v) => setForm((f) => ({ ...f, diasSemana: v }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <TimePicker
                  label="Horário da aula *"
                  value={form.horario}
                  onChange={(v) => setForm((f) => ({ ...f, horario: v }))}
                />
              </View>

              <View style={styles.fieldGroup}>
                <DatePicker
                  label="Data final da matéria (opcional)"
                  value={form.dataFim}
                  onChange={(v) => setForm((f) => ({ ...f, dataFim: v }))}
                  placeholder="Até o fim do semestre"
                />
                {form.dataFim ? (
                  <TouchableOpacity
                    style={styles.btnClearDate}
                    onPress={() => setForm((f) => ({ ...f, dataFim: '' }))}
                  >
                    <Text style={styles.btnClearDateText}>Limpar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => setModalVisible(false)}
                >
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
    alignItems: 'center',
  },
  cardNome: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  cardSub: { fontSize: 13, color: colors.textSecondary },
  cardActions: { flexDirection: 'row', gap: spacing.xs },
  btnIcon: { padding: spacing.xs },
  btnIconText: { fontSize: 16 },

  empty: { alignItems: 'center', paddingTop: spacing.xl * 2, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

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
    maxHeight: '90%',
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

  btnClearDate: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnClearDateText: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
});
