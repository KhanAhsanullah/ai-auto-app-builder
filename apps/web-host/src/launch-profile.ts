import {
  DEMO_LAUNCH_VERTICALS,
  type DemoLaunchInput,
  type DemoLaunchVertical,
} from '@ai-commerce/web-store';

export const WEB_HOST_LAUNCH_KEY = '@ai-commerce/web-host/launch-profile/v1';

export interface StoredLaunchProfile extends DemoLaunchInput {
  tenantId: string;
  createdAt: string;
}

export function parseLaunchProfile(
  raw: string | null | undefined,
): StoredLaunchProfile | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as StoredLaunchProfile;
    if (!parsed?.businessName?.trim() || !parsed?.vertical || !parsed?.tenantId) {
      return undefined;
    }
    if (!(DEMO_LAUNCH_VERTICALS as readonly string[]).includes(parsed.vertical)) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export async function loadLaunchProfile(store: {
  getItem(key: string): Promise<string | null>;
}): Promise<StoredLaunchProfile | undefined> {
  return parseLaunchProfile(await store.getItem(WEB_HOST_LAUNCH_KEY));
}

export async function saveLaunchProfile(
  store: {
    setItem(key: string, value: string): Promise<void>;
  },
  profile: StoredLaunchProfile,
): Promise<void> {
  await store.setItem(WEB_HOST_LAUNCH_KEY, JSON.stringify(profile));
}

export async function clearLaunchProfile(store: {
  removeItem?(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
}): Promise<void> {
  if (typeof store.removeItem === 'function') {
    await store.removeItem(WEB_HOST_LAUNCH_KEY);
    return;
  }
  await store.setItem(WEB_HOST_LAUNCH_KEY, '');
}

export const LAUNCH_VERTICAL_OPTIONS: ReadonlyArray<{
  id: DemoLaunchVertical;
  label: string;
  hint: string;
}> = [
  { id: 'grocery', label: 'Grocery', hint: 'Fresh food & essentials delivery' },
  { id: 'restaurant', label: 'Restaurant', hint: 'Menu ordering & takeaway' },
  { id: 'pharmacy', label: 'Pharmacy / Clinic', hint: 'Medicines & care products' },
  { id: 'ecommerce', label: 'Ecommerce', hint: 'General online store' },
  { id: 'fashion', label: 'Fashion', hint: 'Apparel & style' },
  { id: 'electronics', label: 'Electronics', hint: 'Gadgets & devices' },
];
