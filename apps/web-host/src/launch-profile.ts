import {
  DEMO_LAUNCH_VERTICAL_PRIMARY,
  DEMO_LAUNCH_VERTICALS,
  type DemoLaunchInput,
  type DemoLaunchVertical,
} from '@ai-commerce/web-store';

/** @deprecated single-profile key — migrated into {@link WEB_HOST_LAUNCH_PROFILES_KEY}. */
export const WEB_HOST_LAUNCH_KEY = '@ai-commerce/web-host/launch-profile/v1';

export const WEB_HOST_LAUNCH_PROFILES_KEY = '@ai-commerce/web-host/launch-profiles/v1';

export interface StoredLaunchProfile extends DemoLaunchInput {
  tenantId: string;
  createdAt: string;
}

export interface LaunchProfileRegistry {
  version: 1;
  activeTenantId: string | null;
  profiles: StoredLaunchProfile[];
}

export interface LaunchThemeTokens {
  primary: string;
  secondary: string;
  surface: string;
  background: string;
  text: string;
  textMuted: string;
}

/** Vertical theme tokens for live wizard preview (aligned with storefront brand colors). */
export const DEMO_LAUNCH_VERTICAL_THEME: Record<DemoLaunchVertical, LaunchThemeTokens> = {
  grocery: {
    primary: DEMO_LAUNCH_VERTICAL_PRIMARY.grocery,
    secondary: '#F59E0B',
    surface: '#ffffff',
    background: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  restaurant: {
    primary: DEMO_LAUNCH_VERTICAL_PRIMARY.restaurant,
    secondary: '#F97316',
    surface: '#ffffff',
    background: '#fff7ed',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  pharmacy: {
    primary: DEMO_LAUNCH_VERTICAL_PRIMARY.pharmacy,
    secondary: '#0284C7',
    surface: '#ffffff',
    background: '#f0fdfa',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  ecommerce: {
    primary: DEMO_LAUNCH_VERTICAL_PRIMARY.ecommerce,
    secondary: '#7C3AED',
    surface: '#ffffff',
    background: '#eff6ff',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  fashion: {
    primary: DEMO_LAUNCH_VERTICAL_PRIMARY.fashion,
    secondary: '#DB2777',
    surface: '#ffffff',
    background: '#fdf2f8',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  electronics: {
    primary: DEMO_LAUNCH_VERTICAL_PRIMARY.electronics,
    secondary: '#0EA5E9',
    surface: '#ffffff',
    background: '#eff6ff',
    text: '#0f172a',
    textMuted: '#64748b',
  },
};

type KvGet = { getItem(key: string): Promise<string | null> };
type KvSet = { setItem(key: string, value: string): Promise<void> };
type KvRemove = {
  removeItem?(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
};

export function parseLaunchProfile(
  raw: string | null | undefined,
): StoredLaunchProfile | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as StoredLaunchProfile;
    return normalizeProfile(parsed);
  } catch {
    return undefined;
  }
}

function normalizeProfile(
  parsed: StoredLaunchProfile | undefined,
): StoredLaunchProfile | undefined {
  if (!parsed?.businessName?.trim() || !parsed?.vertical || !parsed?.tenantId?.trim()) {
    return undefined;
  }
  if (!(DEMO_LAUNCH_VERTICALS as readonly string[]).includes(parsed.vertical)) {
    return undefined;
  }
  return {
    ...parsed,
    businessName: parsed.businessName.trim(),
    tenantId: parsed.tenantId.trim(),
    slug: parsed.slug?.trim() || undefined,
    logoUrl: parsed.logoUrl?.trim() || undefined,
  };
}

export function parseLaunchProfileRegistry(
  raw: string | null | undefined,
): LaunchProfileRegistry | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as LaunchProfileRegistry;
    if (parsed?.version !== 1 || !Array.isArray(parsed.profiles)) {
      return undefined;
    }
    const profiles = parsed.profiles
      .map((profile) => normalizeProfile(profile))
      .filter((profile): profile is StoredLaunchProfile => Boolean(profile));
    let activeTenantId: string | null = null;
    if (parsed.activeTenantId === null) {
      activeTenantId = null;
    } else if (
      typeof parsed.activeTenantId === 'string' &&
      profiles.some((profile) => profile.tenantId === parsed.activeTenantId)
    ) {
      activeTenantId = parsed.activeTenantId;
    } else {
      activeTenantId = profiles[0]?.tenantId ?? null;
    }
    return { version: 1, activeTenantId, profiles };
  } catch {
    return undefined;
  }
}

async function writeRegistry(store: KvSet, registry: LaunchProfileRegistry): Promise<void> {
  await store.setItem(WEB_HOST_LAUNCH_PROFILES_KEY, JSON.stringify(registry));
}

async function removeLegacyProfile(store: KvRemove): Promise<void> {
  if (typeof store.removeItem === 'function') {
    await store.removeItem(WEB_HOST_LAUNCH_KEY);
    return;
  }
  await store.setItem(WEB_HOST_LAUNCH_KEY, '');
}

/** Load registry; migrates legacy single-profile key when present. */
export async function loadLaunchProfileRegistry(
  store: KvGet & KvRemove,
): Promise<LaunchProfileRegistry> {
  const existing = parseLaunchProfileRegistry(await store.getItem(WEB_HOST_LAUNCH_PROFILES_KEY));
  if (existing) {
    return existing;
  }

  const legacy = parseLaunchProfile(await store.getItem(WEB_HOST_LAUNCH_KEY));
  if (!legacy) {
    return { version: 1, activeTenantId: null, profiles: [] };
  }

  const migrated: LaunchProfileRegistry = {
    version: 1,
    activeTenantId: legacy.tenantId,
    profiles: [legacy],
  };
  await writeRegistry(store, migrated);
  await removeLegacyProfile(store);
  return migrated;
}

/** Active profile (or undefined when empty). */
export async function loadLaunchProfile(
  store: KvGet & KvRemove,
): Promise<StoredLaunchProfile | undefined> {
  const registry = await loadLaunchProfileRegistry(store);
  if (!registry.activeTenantId) {
    return registry.profiles[0];
  }
  return (
    registry.profiles.find((profile) => profile.tenantId === registry.activeTenantId) ??
    registry.profiles[0]
  );
}

export async function listLaunchProfiles(store: KvGet & KvRemove): Promise<StoredLaunchProfile[]> {
  const registry = await loadLaunchProfileRegistry(store);
  return [...registry.profiles].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Insert or update a profile and mark it active. */
export async function upsertLaunchProfile(
  store: KvSet & KvRemove & KvGet,
  profile: StoredLaunchProfile,
): Promise<LaunchProfileRegistry> {
  const normalized = normalizeProfile(profile);
  if (!normalized) {
    throw new Error('Invalid launch profile.');
  }
  const registry = await loadLaunchProfileRegistry(store);
  const index = registry.profiles.findIndex((item) => item.tenantId === normalized.tenantId);
  const profiles = [...registry.profiles];
  if (index >= 0) {
    profiles[index] = { ...profiles[index], ...normalized };
  } else {
    profiles.push(normalized);
  }
  const next: LaunchProfileRegistry = {
    version: 1,
    activeTenantId: normalized.tenantId,
    profiles,
  };
  await writeRegistry(store, next);
  await removeLegacyProfile(store);
  return next;
}

/** @deprecated use {@link upsertLaunchProfile} */
export async function saveLaunchProfile(
  store: KvSet & KvRemove & KvGet,
  profile: StoredLaunchProfile,
): Promise<void> {
  await upsertLaunchProfile(store, profile);
}

export async function setActiveLaunchProfile(
  store: KvSet & KvRemove & KvGet,
  tenantId: string,
): Promise<StoredLaunchProfile | undefined> {
  const id = tenantId.trim();
  const registry = await loadLaunchProfileRegistry(store);
  const profile = registry.profiles.find((item) => item.tenantId === id);
  if (!profile) {
    return undefined;
  }
  await writeRegistry(store, { ...registry, activeTenantId: id });
  return profile;
}

export async function removeLaunchProfile(
  store: KvSet & KvRemove & KvGet,
  tenantId: string,
): Promise<LaunchProfileRegistry> {
  const id = tenantId.trim();
  const registry = await loadLaunchProfileRegistry(store);
  const profiles = registry.profiles.filter((item) => item.tenantId !== id);
  const activeTenantId =
    registry.activeTenantId === id ? (profiles[0]?.tenantId ?? null) : registry.activeTenantId;
  const next: LaunchProfileRegistry = { version: 1, activeTenantId, profiles };
  await writeRegistry(store, next);
  return next;
}

export async function clearLaunchProfile(store: KvRemove): Promise<void> {
  if (typeof store.removeItem === 'function') {
    await store.removeItem(WEB_HOST_LAUNCH_KEY);
    await store.removeItem(WEB_HOST_LAUNCH_PROFILES_KEY);
    return;
  }
  await store.setItem(WEB_HOST_LAUNCH_KEY, '');
  await store.setItem(WEB_HOST_LAUNCH_PROFILES_KEY, '');
}

/** Clear only the active pointer; keep saved profiles (New app → wizard). */
export async function clearActiveLaunchProfile(store: KvSet & KvRemove & KvGet): Promise<void> {
  const registry = await loadLaunchProfileRegistry(store);
  await writeRegistry(store, { ...registry, activeTenantId: null });
}

export const LAUNCH_VERTICAL_OPTIONS: ReadonlyArray<{
  id: DemoLaunchVertical;
  label: string;
  hint: string;
  accent: string;
  theme: LaunchThemeTokens;
}> = [
  {
    id: 'grocery',
    label: 'Grocery',
    hint: 'Fresh food & essentials delivery',
    accent: DEMO_LAUNCH_VERTICAL_PRIMARY.grocery,
    theme: DEMO_LAUNCH_VERTICAL_THEME.grocery,
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    hint: 'Menu ordering & takeaway',
    accent: DEMO_LAUNCH_VERTICAL_PRIMARY.restaurant,
    theme: DEMO_LAUNCH_VERTICAL_THEME.restaurant,
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy / Clinic',
    hint: 'Medicines & care products',
    accent: DEMO_LAUNCH_VERTICAL_PRIMARY.pharmacy,
    theme: DEMO_LAUNCH_VERTICAL_THEME.pharmacy,
  },
  {
    id: 'ecommerce',
    label: 'Ecommerce',
    hint: 'General online store',
    accent: DEMO_LAUNCH_VERTICAL_PRIMARY.ecommerce,
    theme: DEMO_LAUNCH_VERTICAL_THEME.ecommerce,
  },
  {
    id: 'fashion',
    label: 'Fashion',
    hint: 'Apparel & style',
    accent: DEMO_LAUNCH_VERTICAL_PRIMARY.fashion,
    theme: DEMO_LAUNCH_VERTICAL_THEME.fashion,
  },
  {
    id: 'electronics',
    label: 'Electronics',
    hint: 'Gadgets & devices',
    accent: DEMO_LAUNCH_VERTICAL_PRIMARY.electronics,
    theme: DEMO_LAUNCH_VERTICAL_THEME.electronics,
  },
];
