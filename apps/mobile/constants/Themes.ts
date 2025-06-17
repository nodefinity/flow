/**
 * https://callstack.github.io/react-native-paper/docs/guides/theming
 */

import { configureFonts, MD3DarkTheme, MD3LightTheme } from 'react-native-paper'
import { Colors } from '@/constants/Colors'

// TODO: change font
// #region custom fonts
const fontConfig = {
  default: {
    fontFamily: 'SpaceMono-Regular',
  },
  displayLarge: {
    fontFamily: 'SpaceMono-Regular',
  },
  displayMedium: {
    fontFamily: 'SpaceMono-Regular',
  },
  displaySmall: {
    fontFamily: 'SpaceMono-Regular',
  },
  headlineLarge: {
    fontFamily: 'SpaceMono-Regular',
  },
  headlineMedium: {
    fontFamily: 'SpaceMono-Regular',
  },
  headlineSmall: {
    fontFamily: 'SpaceMono-Regular',
  },
  titleLarge: {
    fontFamily: 'SpaceMono-Regular',
  },
  titleMedium: {
    fontFamily: 'SpaceMono-Regular',
  },
  titleSmall: {
    fontFamily: 'SpaceMono-Regular',
  },
  bodyLarge: {
    fontFamily: 'SpaceMono-Regular',
  },
  bodyMedium: {
    fontFamily: 'SpaceMono-Regular',
  },
  bodySmall: {
    fontFamily: 'SpaceMono-Regular',
  },
  labelLarge: {
    fontFamily: 'SpaceMono-Regular',
  },
  labelMedium: {
    fontFamily: 'SpaceMono-Regular',
  },
  labelSmall: {
    fontFamily: 'SpaceMono-Regular',
  },
}
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
