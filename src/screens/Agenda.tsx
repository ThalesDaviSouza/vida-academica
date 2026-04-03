import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarGrid from '../components/agenda/CalendarGrid';
import DayDetails from '../components/agenda/DayDetails';
import MonthNav from '../components/agenda/MonthNav';
import PageHeader from '../components/PageHeader';
import { useAgenda } from '../hooks/useAgenda';
import { colors } from '../theme';

export default function AgendaScreen() {
  const {
    semestres,
    semestreAtivo,
    setAtivo,
    monthTitle,
    goPrevMonth,
    goNextMonth,
    cells,
    selectDay,
    details,
  } = useAgenda();

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Agenda"
        semestres={semestres}
        semestreAtivoId={semestreAtivo?.id}
        onSelectSemestreAtivo={setAtivo}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <MonthNav title={monthTitle} onPrev={goPrevMonth} onNext={goNextMonth} />
        <CalendarGrid cells={cells} onSelectDay={selectDay} />
        <DayDetails details={details} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});

