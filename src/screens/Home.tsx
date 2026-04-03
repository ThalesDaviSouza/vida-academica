import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { HomeItem } from '../models/home';
import type { Materia, Prova, Atividade } from '../models';
import HomeAulaCard from '../components/home/HomeAulaCard';
import HomeAtividadeCard from '../components/home/HomeAtividadeCard';
import HomeProvaCard from '../components/home/HomeProvaCard';
import HomeSection from '../components/home/HomeSection';
import { useHome } from '../hooks/useHome';
import { colors, radius, spacing } from '../theme';
import { replace } from '../navigation/rootNavigation';
import PageHeader from '../components/PageHeader';

export default function HomeScreen() {
  const {
    semestres,
    semestreAtivo,
    setSemestreAtivo,
    dataSelecionada,
    setDataSelecionada,
    items,
    marcarFalta,
  } = useHome();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    'sec-aulas': false,
    'sec-vencendo': false,
    'sec-proximas': false,
  });

  const visibleItems = useMemo(() => {
    let currentSectionId: string | null = null;
    const out: HomeItem[] = [];

    for (const item of items) {
      if (item.type === 'section' && item.variant === 'header') {
        currentSectionId = item.id;
        out.push(item);
        continue;
      }

      const isCollapsed = currentSectionId ? collapsed[currentSectionId] : false;
      if (isCollapsed) continue;
      out.push(item);
    }

    return out;
  }, [items, collapsed]);

  function abrirDetalheMateria(materia: Materia) {
    replace('Matérias', {
      screen: 'MateriaDetalhe',
      params: { materia },
    });
  }

  function abrirDetalheAtividade(atividade: Atividade) {
    replace('Atividades', { openAtividadeId: atividade.id });
  }

  function abrirDetalheProva(prova: Prova) {
    replace('Provas', { openProvaId: prova.id });
  }

  function renderItem({ item }: { item: HomeItem }) {
    if (item.type === 'section') {
      const isHeader = item.variant === 'header';
      const isCollapsed = isHeader ? !!collapsed[item.id] : false;

      return (
        <HomeSection
          title={item.title}
          subtitle={item.subtitle}
          collapsible={isHeader}
          collapsed={isCollapsed}
          onToggle={
            isHeader
              ? () => setCollapsed((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
              : undefined
          }
        />
      );
    }

    if (item.type === 'aula') {
      return (
        <HomeAulaCard
          materia={item.materia}
          dataIso={item.data}
          presenca={item.presenca}
          onToggleFalta={marcarFalta}
          onPress={abrirDetalheMateria}
        />
      );
    }

    if (item.type === 'atividade') {
      return (
        <HomeAtividadeCard
          atividade={item.atividade}
          materia={item.materia}
          dataSelecionadaIso={dataSelecionada}
          onPress={abrirDetalheAtividade}
        />
      );
    }

    return <HomeProvaCard prova={item.prova} materia={item.materia} onPress={abrirDetalheProva} />;
  }

  if (!semestreAtivo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.simpleHeader}>
          <Text style={styles.headerTitle}>Semestre Ativo</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗓️</Text>
          <Text style={styles.emptyText}>Nenhum semestre ativo</Text>
          <Text style={styles.emptySub}>Defina um semestre ativo para ver o resumo do dia</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Hoje"
        semestres={semestres}
        semestreAtivoId={semestreAtivo.id}
        onSelectSemestreAtivo={setSemestreAtivo}
        dateIso={dataSelecionada}
        onDateChange={setDataSelecionada}
      />

      <FlatList
        data={visibleItems}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  simpleHeader: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },

  list: { padding: spacing.md, gap: spacing.sm },

  empty: { alignItems: 'center', paddingTop: spacing.xl * 2, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  emptySub: { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.lg },
});
