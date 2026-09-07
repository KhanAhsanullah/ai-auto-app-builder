import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
 * Boom launch form — business name, logo URL, any app type (vertical).
 */
export function LaunchWizard(props: LaunchWizardProps): ReactNode {
  const { busy = false, error, onLaunch } = props;
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [vertical, setVertical] = useState<DemoLaunchVertical>('grocery');

  const selected = useMemo(
    () => LAUNCH_VERTICAL_OPTIONS.find((o) => o.id === vertical),
    [vertical],
  );

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
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
      testID="mobile-host-launch-wizard"
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>CommerceOS</Text>
        <Text style={styles.title}>Launch your app</Text>
        <Text style={styles.sub}>
          Enter business name, optional logo, and app type — then Boom, your mobile store is ready.
        </Text>

        <Text style={styles.label}>Business name</Text>
        <TextInput
          testID="launch-business-name"
          style={styles.input}
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
                style={[styles.typeCard, selectedType && styles.typeCardSelected]}
              >
                <Text style={styles.typeLabel}>{option.label}</Text>
                <Text style={styles.typeHint}>{option.hint}</Text>
              </Pressable>
            );
          })}
        </View>

        {selected ? <Text style={styles.selectedHint}>Selected: {selected.label}</Text> : null}
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
          style={[styles.submit, (busy || !businessName.trim()) && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>{busy ? 'Launching…' : 'Boom — launch app'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  title: {
    fontSize: 26,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  typeGrid: {
    gap: 8,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  typeCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  typeHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  selectedHint: {
    fontSize: 12,
    color: '#64748b',
  },
  error: {
    color: '#b91c1c',
    fontSize: 13,
  },
  submit: {
    marginTop: 8,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 15,
  },
});
