import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DatePicker from '../DatePicker';
import { colors, spacing } from '../../theme';
import type { Semestre } from '../../models';
import { radius } from '../../theme';

type Props = {
  title: string;
  semestres: Semestre[];
  semestreAtivoId?: string;
  dateIso: string;
  onDateChange: (iso: string) => void;
  onSelectSemestreAtivo: (id: string) => void;
};

export default function HomeHeader({
  title,
  semestres,
  semestreAtivoId,
  dateIso,
  onDateChange,
  onSelectSemestreAtivo,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const semestreAtivoNome = useMemo(() => {
    return semestres.find((s) => s.id === semestreAtivoId)?.nome ?? 'Selecionar';
  }, [semestres, semestreAtivoId]);

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}
          style={styles.semestreBtn}
        >
          <Text style={styles.headerSub}>Semestre: {semestreAtivoNome}</Text>
          <Text style={styles.semestreChevron}>▾</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.datePickerWrap}>
        <DatePicker label="Data" value={dateIso} onChange={onDateChange} />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Selecionar semestre ativo</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {semestres.map((s) => {
              const active = s.id === semestreAtivoId;
              return (
                <TouchableOpacity
                  key={s.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    onSelectSemestreAtivo(s.id);
                    setModalVisible(false);
                  }}
                  style={[styles.semestreItem, active && styles.semestreItemActive]}
                >
                  <Text style={[styles.semestreItemText, active && styles.semestreItemTextActive]}>
                    {s.nome}
                  </Text>
                  {active ? <Text style={styles.semestreItemCheck}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  headerSub: { fontSize: 13, color: colors.textSecondary },
  datePickerWrap: { marginTop: spacing.xs },

  semestreBtn: {
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  semestreChevron: { color: colors.textMuted, fontWeight: '900' },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCard: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    top: spacing.xl * 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    maxHeight: '70%',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  semestreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceHigh,
    marginBottom: spacing.sm,
  },
  semestreItemActive: {
    borderColor: colors.primary,
  },
  semestreItemText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  semestreItemTextActive: {
    color: colors.primaryLight,
  },
  semestreItemCheck: {
    color: colors.primaryLight,
    fontWeight: '900',
  },
});
