import { useMemo, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { DemoLaunchVertical } from '@ai-commerce/mobile-app';

import { LAUNCH_VERTICAL_OPTIONS } from './launch-profile.js';

export interface LaunchWizardSubmit {
  businessName: string;
  vertical: DemoLaunchVertical;
  logoUrl?: string;
}

export interface LaunchWizardProps {
  busy?: boolean;
  error?: string | null;
  onLaunch: (input: LaunchWizardSubmit) => void;
}

/**
 * Boom launch form — live brand preview tinted by the selected vertical.
 */
export function LaunchWizard(props: LaunchWizardProps): ReactNode {
  const { busy = false, error, onLaunch } = props;
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [vertical, setVertical] = useState<DemoLaunchVertical>('grocery');

  const selected = useMemo(
    () => LAUNCH_VERTICAL_OPTIONS.find((o) => o.id === vertical) ?? LAUNCH_VERTICAL_OPTIONS[0]!,
    [vertical],
  );

  const previewName = businessName.trim() || 'Your business';
  const accent = selected.accent;

  const submit = () => {
    const name = businessName.trim();
    if (!name || busy) {
      return;
    }
    onLaunch({
      businessName: name,
      vertical,
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.page, { backgroundColor: tint(accent, 0.08) }]}
      keyboardShouldPersistTaps="handled"
      testID="mobile-host-launch-wizard"
    >
      <View style={styles.preview}>
        {logoUrl.trim() ? (
          <Image
            source={{ uri: logoUrl.trim() }}
            style={styles.logo}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.mark, { backgroundColor: accent }]}>
            <Text style={styles.markText}>{initials(previewName)}</Text>
          </View>
        )}
        <Text style={[styles.kicker, { color: accent }]}>{selected.label}</Text>
        <Text style={styles.brand} testID="launch-preview-brand">
          {previewName}
        </Text>
        <Text style={styles.tagline}>{selected.hint}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.eyebrow}>CommerceOS</Text>
        <Text style={styles.title}>Launch your app</Text>
        <Text style={styles.sub}>Name, logo, app type — then Boom.</Text>

        <Text style={styles.label}>Business name</Text>
        <TextInput
          testID="launch-business-name"
          style={[styles.input, { borderColor: busy ? '#cbd5e1' : '#cbd5e1' }]}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="e.g. Spice Route Kitchen"
          editable={!busy}
          autoFocus
        />

        <Text style={styles.label}>Logo URL (optional)</Text>
        <TextInput
          testID="launch-logo-url"
          style={styles.input}
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://…"
          autoCapitalize="none"
          editable={!busy}
        />

        <Text style={styles.label}>App type</Text>
        <View style={styles.typeGrid}>
          {LAUNCH_VERTICAL_OPTIONS.map((option) => {
            const selectedType = vertical === option.id;
            return (
              <Pressable
                key={option.id}
                testID={`launch-type-${option.id}`}
                disabled={busy}
                onPress={() => setVertical(option.id)}
                style={[
                  styles.typeCard,
                  selectedType && {
                    borderColor: option.accent,
                    backgroundColor: tint(option.accent, 0.12),
                  },
                ]}
              >
                <View style={[styles.typeSwatch, { backgroundColor: option.accent }]} />
                <View style={styles.typeText}>
                  <Text style={styles.typeLabel}>{option.label}</Text>
                  <Text style={styles.typeHint}>{option.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text style={styles.error} testID="launch-error">
            {error}
          </Text>
        ) : null}

        <Pressable
          testID="launch-submit"
          accessibilityRole="button"
          disabled={busy || !businessName.trim()}
          onPress={submit}
          style={[
            styles.submit,
            { backgroundColor: accent },
            (busy || !businessName.trim()) && styles.submitDisabled,
          ]}
        >
          <Text style={styles.submitText}>{busy ? 'Launching…' : 'Boom — launch app'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

/** Approximate translucent wash for RN (no color-mix). */
function tint(hex: string, alpha: number): string {
  if (hex.length !== 7 || !hex.startsWith('#')) {
    return '#f8fafc';
  }
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
  },
  preview: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  brand: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#0f172a',
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748b',
    maxWidth: 320,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  sub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  typeGrid: {
    gap: 8,
  },
  typeCard: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  typeSwatch: {
    width: 8,
    borderRadius: 999,
    alignSelf: 'stretch',
  },
  typeText: {
    flex: 1,
    gap: 2,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  typeHint: {
    fontSize: 12,
    color: '#64748b',
  },
  error: {
    color: '#b91c1c',
    fontSize: 13,
  },
  submit: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
