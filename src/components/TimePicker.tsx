import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, radius } from '../theme';

interface Props {
  label: string;
  value: string;        // 'HH:mm'
  onChange: (time: string) => void;
}

export default function TimePicker({ label, value, onChange }: Props) {
  const [show, setShow] = useState(false);

  const date = parseTime(value);

  function handleChange(_: any, selected?: Date) {
    if (Platform.OS === 'android') setShow(false);
    if (selected) {
      const h = String(selected.getHours()).padStart(2, '0');
      const m = String(selected.getMinutes()).padStart(2, '0');
      onChange(`${h}:${m}`);
    }
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value || 'Selecionar horário'}
        </Text>
        <Text style={styles.icon}>🕐</Text>
      </TouchableOpacity>

      {Platform.OS === 'android' && show && (
        <RNDateTimePicker
          value={date}
          mode="time"
          is24Hour
          display="default"
          onChange={handleChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.btnConfirmar}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <RNDateTimePicker
                value={date}
                mode="time"
                is24Hour
                display="spinner"
                onChange={handleChange}
                textColor={colors.textPrimary}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function parseTime(value: string): Date {
  const d = new Date();
  if (value) {
    const [h, m] = value.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d;
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: { color: colors.textPrimary, fontSize: 15 },
  placeholderText: { color: colors.textMuted, fontSize: 15 },
  icon: { fontSize: 16 },
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  btnConfirmar: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  picker: { height: 200 },
});