import type { NormalizedDesignTokens, ReactNativeThemeOutput, ThemeEmitter } from '../../types.js';

/** Emits React Native theme objects for mobile surfaces. */
export class ReactNativeEmitter implements ThemeEmitter<'react-native'> {
  readonly surface = 'react-native' as const;

  emit(tokens: NormalizedDesignTokens): ReactNativeThemeOutput {
    const shared = {
      typography: tokens.typography,
      spacing: tokens.spacing,
      radius: tokens.radius,
      elevation: tokens.elevation,
      motion: tokens.motion,
      componentVariants: tokens.componentVariants,
    };

    return {
      surface: this.surface,
      light: {
        colors: tokens.modes.light,
        ...shared,
      },
      dark: {
        colors: tokens.modes.dark,
        ...shared,
      },
      darkModeEnabled: tokens.darkModeEnabled,
      modeStrategy: tokens.modeStrategy,
    };
  }
}
