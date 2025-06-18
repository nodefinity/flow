/**
 * https://callstack.github.io/react-native-paper/docs/guides/theming
 */

import { configureFonts, MD3DarkTheme, MD3LightTheme } from 'react-native-paper'
import { Colors } from '@/constants/Colors'

// TODO: change font
// #region custom fonts
const fontConfig = {
  default: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
  },
  displayLarge: {
    fontSize: 57,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 26,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
} as const
// #endregion

const fonts = configureFonts({ config: fontConfig, isV3: true })

const BaseLightTheme = {
  ...MD3LightTheme,
  fonts,
}

const BaseDarkTheme = {
  ...MD3DarkTheme,
  fonts,
}

// #region custom colors
const Themes = {
  light: {
    default: BaseLightTheme,
    orange: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.orange,
      },
    },
    red: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.red,
      },
    },
    violet: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.violet,
      },
    },
    indigo: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.indigo,
      },
    },
    blue: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.blue,
      },
    },
    teal: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.teal,
      },
    },
    cyan: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.cyan,
      },
    },
    green: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.green,
      },
    },
    lime: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.lime,
      },
    },
    olive: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.olive,
      },
    },
    brown: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.brown,
      },
    },
  },
  dark: {
    default: BaseDarkTheme,
    red: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.red,
      },
    },
    orange: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.orange,
      },
    },
    violet: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.violet,
      },
    },
    indigo: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.indigo,
      },
    },
    blue: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.blue,
      },
    },
    teal: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.teal,
      },
    },
    cyan: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.cyan,
      },
    },
    green: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.green,
      },
    },
    lime: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.lime,
      },
    },
    olive: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.olive,
      },
    },
    brown: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.brown,
      },
    },
  },
}
// #endregion

export default Themes
