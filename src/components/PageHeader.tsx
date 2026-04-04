import { ReactNode, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { Semestre } from '../models';
import DatePicker from './DatePicker';

type Props = {
  title: string;
  semestres: Semestre[];
  semestreAtivoId?: string;
  onSelectSemestreAtivo: (id: string) => void;
  rightAction?: ReactNode;
  leftAction?: ReactNode;
  dateIso?: string;
  onDateChange?: (iso: string) => void;
};

export default function PageHeader({
  title,
  semestres,
  semestreAtivoId,
  onSelectSemestreAtivo,
  rightAction,
  leftAction,
  dateIso,
  onDateChange,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const semestreAtivoNome = useMemo(() => {
    return semestres.find((s) => s.id === semestreAtivoId)?.nome ?? 'Selecionar';
  }, [semestres, semestreAtivoId]);

  const showDatePicker = !!dateIso && !!onDateChange;

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {leftAction ? <View style={styles.slotLeft}>{leftAction}</View> : null}
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.slotRight}>
          <View style={styles.rightRow}>
            {rightAction ? <View style={styles.rightActionWrap}>{rightAction}</View> : null}
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
        style={styles.semestreBtn}
      >
        <Text style={styles.semestreText}>Semestre: {semestreAtivoNome}</Text>
        <Text style={styles.semestreChevron}>▾</Text>
      </TouchableOpacity>

      {showDatePicker ? (
        <View style={styles.datePickerWrap}>
          <DatePicker label="Data" value={dateIso} onChange={onDateChange} />
        </View>
      ) : null}

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
    // Space reserved for the global menu button (rendered in AppNavigator)
    // so it does not overlap header actions on the right.
    paddingRight: spacing.md + 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  slotLeft: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  slotRight: { minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  titleWrap: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rightActionWrap: { maxWidth: 180, flexShrink: 1 },

  semestreBtn: {
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
  semestreText: { fontSize: 13, color: colors.textSecondary },
  semestreChevron: { color: colors.textMuted, fontWeight: '900' },

  datePickerWrap: { marginTop: spacing.xs },

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
