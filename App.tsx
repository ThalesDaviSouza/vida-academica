import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/storage/database';
import AppNavigator from './src/navigation/AppNavigator';
import { useSemestresStore } from './src/store/semestresStore';
import { useMateriasStore } from './src/store/materiasStore';
import { usePresencasStore } from './src/store/presencasStore';
import { colors } from './src/theme';
import { initNotifications } from './src/services/notificationsService';

export default function App() {
  const { load: loadSemestres, semestreAtivo } = useSemestresStore();
  const { load: loadMaterias, materias } = useMateriasStore();
  const { autoPresencaTodas } = usePresencasStore();

  useEffect(() => {
    initDatabase();
    void initNotifications();
    loadSemestres();
  }, []);

  useEffect(() => {
    if (semestreAtivo) loadMaterias(semestreAtivo.id);
  }, [semestreAtivo]);

  useEffect(() => {
    if (semestreAtivo && materias.length > 0) {
      autoPresencaTodas(materias, semestreAtivo);
    }
  }, [materias]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.surface} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
