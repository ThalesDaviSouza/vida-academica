import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/Home';
import MateriasNavigator from './MateriasNavigator';
import AgendaScreen from '../screens/Agenda';
import AtividadesScreen from '../screens/Atividades';
import ProvasScreen from '../screens/Provas';
import SemestresScreen from '../screens/Semestres';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Hoje',       component: HomeScreen,        icon: '🏠' },
  { name: 'Matérias',   component: MateriasNavigator, icon: '📚' },
  { name: 'Agenda',     component: AgendaScreen,      icon: '📅' },
  { name: 'Atividades', component: AtividadesScreen,  icon: '✅' },
  { name: 'Provas',     component: ProvasScreen,      icon: '📝' },
  { name: 'Semestres',  component: SemestresScreen,   icon: '🗓️' },
];

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        {TABS.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: focused ? 20 : 17 }}>{tab.icon}</Text>
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}