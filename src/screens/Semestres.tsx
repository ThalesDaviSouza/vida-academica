import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useSemestresStore } from '../store/semestresStore';
import { Semestre } from '../models';
import { colors, spacing, radius } from '../theme';
import DatePicker from '../components/DatePicker';

const EMPTY_FORM = { nome: '', dataInicio: '', dataFim: '' };

export default function SemestresScreen() {
  const { semestres, load, criar, editar, setAtivo, deletar } = useSemestresStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Semestre | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { load(); }, []);

  function abrirCriar() {
    setEditando(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function abrirEditar(s: Semestre) {
    setEditando(s);
    setForm({ nome: s.nome, dataInicio: s.dataInicio, dataFim: s.dataFim });
    setModalVisible(true);
  }

  function salvar() {
    if (!form.nome.trim() || !form.dataInicio || !form.dataFim) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (editando) {
      editar({ ...editando, ...form });
    } else {
      criar(form);
    }
    setModalVisible(false);
  }

  function confirmarDeletar(s: Semestre) {
    Alert.alert(
      'Excluir semestre',
      `Deseja excluir "${s.nome}"? Todas as matérias e dados vinculados serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deletar(s.id) },
      ]
    );
  }

  function renderItem({ item }: { item: Semestre }) {
    return (
      <View style={[styles.card, item.ativo && styles.cardAtivo]}>
        <View style={styles.cardLeft}>
          {item.ativo && <View style={styles.badge}><Text style={styles.badgeText}>ATIVO</Text></View>}
          <Text style={styles.cardNome}>{item.nome}</Text>
          <Text style={styles.cardDatas}>
            {formatarData(item.dataInicio)} → {formatarData(item.dataFim)}
          </Text>
        </View>
        <View style={styles.cardActions}>
          {!item.ativo && (
            <TouchableOpacity style={styles.btnAtivo} onPress={() => setAtivo(item.id)}>
              <Text style={styles.btnAtivoText}>Definir ativo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnIcon} onPress={() => abrirEditar(item)}>
            <Text style={styles.btnIconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnIcon} onPress={() => confirmarDeletar(item)}>
            <Text style={styles.btnIconText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Semestres</Text>
        <TouchableOpacity style={styles.btnNovo} onPress={abrirCriar}>
          <Text style={styles.btnNovoText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={semestres}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗓️</Text>
            <Text style={styles.emptyText}>Nenhum semestre cadastrado</Text>
            <Text style={styles.emptySubtext}>Crie seu primeiro semestre para começar</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editando ? 'Editar semestre' : 'Novo semestre'}
            </Text>

            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2026/1"
              placeholderTextColor={colors.textMuted}
              value={form.nome}
              onChangeText={(v) => setForm((f) => ({ ...f, nome: v }))}
            />

            <DatePicker
              label="Data de início *"
              value={form.dataInicio}
              onChange={(v) => setForm((f) => ({ ...f, dataInicio: v }))}
            />

            <DatePicker
              label="Data de fim *"
              value={form.dataFim}
              onChange={(v) => setForm((f) => ({ ...f, dataFim: v }))}
            />

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
  btnNovo: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  btnNovoText: { color: '#fff', fontWeight: '600' },

  list: { padding: spacing.md, gap: spacing.sm },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAtivo: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceHigh,
  },
  cardLeft: { flex: 1, gap: spacing.xs },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardNome: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  cardDatas: { fontSize: 12, color: colors.textSecondary },

  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btnAtivo: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  btnAtivoText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  btnIcon: { padding: spacing.xs },
  btnIconText: { fontSize: 16 },

  empty: { alignItems: 'center', paddingTop: spacing.xl * 2, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  emptySubtext: { fontSize: 14, color: colors.textSecondary },

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
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  label: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
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