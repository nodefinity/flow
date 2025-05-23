export type ColorSchemeType = "light" | "dark" | null | undefined;

export interface ColorSchemeAdapter {
  useColorScheme: () => ColorSchemeType;
}

export type ColorSchemeHook = () => ColorSchemeType;

const defaultAdapter: ColorSchemeAdapter = {
  useColorScheme() {
    return "light";
  },
};

let currentAdapter: ColorSchemeAdapter = defaultAdapter;

export function registerColorSchemeAdapter(adapter: ColorSchemeAdapter): void {
  currentAdapter = adapter;
}

export function useColorScheme(){
  return currentAdapter.useColorScheme();
}
