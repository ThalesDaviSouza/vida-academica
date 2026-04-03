import { createContext, ReactNode, useContext } from 'react';

type MenuContextValue = {
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({
  value,
  children,
}: {
  value: MenuContextValue;
  children: ReactNode;
}) {
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useAppMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    return {
      menuOpen: false,
      toggleMenu: () => {},
      closeMenu: () => {},
    };
  }
  return ctx;
}

