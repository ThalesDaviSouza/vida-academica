import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import { useSemestresStore } from '../store/semestresStore';
import { colors, spacing } from '../theme';

export default function AgendaScreen() {
  const { semestres, semestreAtivo, load, setAtivo } = useSemestresStore();

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Agenda"
        semestres={semestres}
        semestreAtivoId={semestreAtivo?.id}
        onSelectSemestreAtivo={setAtivo}
      />

      <View style={styles.body}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.sub}>Em breve: visao de calendario.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
  sub: { marginTop: spacing.sm, color: colors.textSecondary, textAlign: 'center' },
});

