import type { CssVariablesOutput, NormalizedDesignTokens, ThemeEmitter } from '../../types.js';
import {
  buildColorVariables,
  buildSharedDesignVariables,
  renderCssStylesheet,
} from './emitter-utils.js';

/** Emits CSS custom property bundles for web surfaces. */
export class CssVariablesEmitter implements ThemeEmitter<'css'> {
  readonly surface = 'css' as const;

  emit(tokens: NormalizedDesignTokens): CssVariablesOutput {
    const shared = buildSharedDesignVariables(tokens);
    const lightVariables = { ...shared, ...buildColorVariables(tokens.modes.light) };
    const darkVariables = tokens.darkModeEnabled
      ? { ...shared, ...buildColorVariables(tokens.modes.dark) }
      : lightVariables;

    return {
      surface: this.surface,
      css: renderCssStylesheet(lightVariables, darkVariables),
      variables: lightVariables,
      darkVariables,
    };
  }
}
