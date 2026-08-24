import React from 'react';
import { vi } from 'vitest';

type HostProps = React.PropsWithChildren<
  Record<string, unknown> & {
    testID?: string;
    onPress?: () => void;
    style?: unknown;
    accessibilityRole?: string;
    accessibilityState?: { selected?: boolean };
    numberOfLines?: number;
  }
>;

function host(tag: string) {
  return function MockHost(props: HostProps) {
    const {
      testID,
      onPress,
      children,
      accessibilityRole,
      accessibilityState,
      numberOfLines: _numberOfLines,
      accessibilityLabel: _accessibilityLabel,
      style: _style,
      ...rest
    } = props;
    const element = tag === 'button' || onPress ? 'button' : 'div';
    return React.createElement(
      element,
      {
        ...rest,
        'data-testid': testID,
        role: accessibilityRole,
        'aria-selected': accessibilityState?.selected,
        onClick: onPress,
        type: element === 'button' ? 'button' : undefined,
      },
      children,
    );
  };
}

vi.mock('react-native', () => ({
  View: host('div'),
  Text: host('span'),
  Pressable: host('button'),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
    hairlineWidth: 1,
  },
  Platform: {
    OS: 'ios',
    select: <T>(options: { ios?: T; default?: T }): T | undefined => options.ios ?? options.default,
  },
}));
