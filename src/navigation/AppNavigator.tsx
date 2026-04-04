import { useEffect, useState } from 'react';
import {
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/Home';
import MateriasNavigator from './MateriasNavigator';
import AgendaScreen from '../screens/Agenda';
import AtividadesScreen from '../screens/Atividades';
import ProvasScreen from '../screens/Provas';
import SemestresScreen from '../screens/Semestres';
import { colors, radius, spacing } from '../theme';
import { navigationRef } from './rootNavigation';
import { MenuProvider } from './MenuContext';

export type RootStackParamList = {
  Hoje: undefined;
  Matérias: undefined;
  Agenda: undefined;
  Atividades: undefined;
  Provas: undefined;
  Semestres: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MENU_ITEMS: Array<{
  name: keyof RootStackParamList;
  component: React.ComponentType;
  icon: string;
}> = [
  { name: 'Hoje', component: HomeScreen, icon: '🏠' },
  { name: 'Agenda', component: AgendaScreen, icon: '📅' },
  { name: 'Matérias', component: MateriasNavigator, icon: '📚' },
  { name: 'Atividades', component: AtividadesScreen, icon: '✅' },
  { name: 'Provas', component: ProvasScreen, icon: '📝' },
  { name: 'Semestres', component: SemestresScreen, icon: '🗓️' },
];

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] =
    useState<keyof RootStackParamList>('Hoje');

  function syncCurrentRoute() {
    const route = navigationRef.getCurrentRoute();

    if (route?.name && MENU_ITEMS.some((item) => item.name === route.name)) {
      setCurrentRoute(route.name as keyof RootStackParamList);
    }
  }

  function navigateTo(routeName: keyof RootStackParamList) {
    setMenuOpen(false);

    if (!navigationRef.isReady()) return;
    if (routeName === currentRoute) return;

    navigationRef.navigate(routeName);
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen) {
        setMenuOpen(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [menuOpen]);

  const menuButtonTop = insets.top + spacing.sm;
  const menuButtonSize = 40;
  const menuTop = menuButtonTop + menuButtonSize + spacing.sm;

  return (
    <MenuProvider
      value={{
        menuOpen,
        toggleMenu: () => setMenuOpen((v) => !v),
        closeMenu: () => setMenuOpen(false),
      }}
    >
      <View style={styles.container}>
        <NavigationContainer
          ref={navigationRef}
          onReady={syncCurrentRoute}
          onStateChange={() => {
            syncCurrentRoute();
            setMenuOpen(false);
          }}
        >
          <Stack.Navigator
            initialRouteName="Hoje"
            screenOptions={{
              animation: 'fade',
              headerShown: false,
              contentStyle: styles.content,
            }}
          >
            {MENU_ITEMS.map((item) => (
              <Stack.Screen
                key={item.name}
                name={item.name}
                component={item.component}
              />
            ))}
          </Stack.Navigator>
        </NavigationContainer>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Abrir menu de navegação"
          activeOpacity={0.85}
          onPress={() => setMenuOpen((v) => !v)}
          style={[styles.menuButton, { top: menuButtonTop, right: spacing.md }]}
        >
          {menuOpen ? (
            <Text style={styles.menuCloseIcon}>X</Text>
          ) : (
            <View style={styles.hamburger} pointerEvents="none">
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          )}
        </TouchableOpacity>

      {menuOpen && (
        <>
          <Pressable
            onPress={() => setMenuOpen(false)}
            style={styles.backdrop}
          />
          <View style={[styles.menu, { top: menuTop }]}>
            {MENU_ITEMS.map((item) => {
              const active = item.name === currentRoute;

              return (
                <TouchableOpacity
                  key={item.name}
                  activeOpacity={0.85}
                  onPress={() => navigateTo(item.name)}
                  style={[styles.menuItem, active && styles.menuItemActive]}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.menuItemText,
                      active && styles.menuItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
      </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    backgroundColor: colors.background,
  },
  menuButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    elevation: 50,
  },
  hamburger: { width: 18, height: 14, justifyContent: 'space-between' },
  hamburgerLine: { height: 2, borderRadius: 2, backgroundColor: colors.textPrimary },
  menuCloseIcon: { color: colors.textPrimary, fontWeight: '900' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 40,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 45,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  menuItemActive: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  menuItemTextActive: {
    color: colors.primaryLight,
  },
});
