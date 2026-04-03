import { StackActions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate(name, params);
}

export function replace(name: string, params?: any) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(StackActions.replace(name, params));
}

