import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Materia } from '../models';
import MateriasScreen from '../screens/Materias';
import MateriaDetalheScreen from '../screens/MateriaDetalhe';

export type MateriasStackParamList = {
  MateriasList: undefined;
  MateriaDetalhe: { materia: Materia };
};

const Stack = createNativeStackNavigator<MateriasStackParamList>();

export default function MateriasNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MateriasList" component={MateriasScreen} />
      <Stack.Screen name="MateriaDetalhe" component={MateriaDetalheScreen} />
    </Stack.Navigator>
  );
}