import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, radius } from '../theme';

interface Props {
  label: string;
  value: string;           // ISO: 'YYYY-MM-DD'
  onChange: (date: string) => void;
  placeholder?: string;
}

export default function DatePicker({ label, value, onChange, placeholder = 'Selecionar data' }: Props) {
  const [show, setShow] = useState(false);

  const date = value ? new Date(`${value}T12:00:00`) : new Date();

  function handleChange(_: any, selected?: Date) {
    if (Platform.OS === 'android') setShow(false);
    if (selected) {
      const ano = selected.getFullYear();
      const mes = String(selected.getMonth() + 1).padStart(2, '0');
      const dia = String(selected.getDate()).padStart(2, '0');
      onChange(`${ano}-${mes}-${dia}`);
    }
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ? formatarData(value) : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {/* Android: renderiza inline quando show=true */}
      {Platform.OS === 'android' && show && (
        <RNDateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}

      {/* iOS: renderiza dentro de modal */}
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
                mode="date"
                display="spinner"
                onChange={handleChange}
                textColor={colors.textPrimary}
                locale="pt-BR"
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
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
  valueText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 15,
  },
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  btnConfirmar: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});