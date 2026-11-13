import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCatalogModule } from '@ai-commerce/module-catalog';

import { createWebStore } from '../../src/infrastructure/create-web-store.js';
import { WebStoreApp } from '../../src/react/web-store-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

describe('WebStoreApp catalog screen', () => {
  it('lists active products on store.catalog when catalog is wired', async () => {
    const catalog = createCatalogModule({
      now: () => '2026-09-04T07:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });
    await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'atta',
      name: 'Atta Flour',
      status: 'active',
      variants: [{ sku: 'ATTA-1', title: '5kg', price: { amount: 12, currency: 'PKR' } }],
    });

    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog,
    });

    render(<WebStoreApp store={store} activeRoute="store.catalog" />);

    await waitFor(() => {
      expect(screen.getByTestId('web-catalog-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId('web-catalog-item-atta').textContent).toContain('Atta Flour');
  });

  it('shows empty state when catalog has no active products', async () => {
    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog: createCatalogModule(),
    });

    render(<WebStoreApp store={store} activeRoute="store.catalog" />);

    await waitFor(() => {
      expect(screen.getByTestId('web-catalog-empty')).toBeTruthy();
    });
  });

  it('filters by category chip and search together', async () => {
    const catalog = createCatalogModule({
      now: () => '2026-09-04T07:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });
    const mains = await catalog.createCategory({
      tenantId: TENANT_ID,
      slug: 'mains',
      name: 'Mains',
      sortOrder: 1,
    });
    const drinks = await catalog.createCategory({
      tenantId: TENANT_ID,
      slug: 'drinks',
      name: 'Drinks',
      sortOrder: 2,
    });
    await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'biryani',
      name: 'Chicken Biryani',
      status: 'active',
      categoryIds: [mains.id],
      variants: [{ sku: 'BRY-1', title: 'Plate', price: { amount: 650, currency: 'PKR' } }],
    });
    await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'chai',
      name: 'Karak Chai',
      status: 'active',
      categoryIds: [drinks.id],
      variants: [{ sku: 'CHAI-1', title: 'Cup', price: { amount: 150, currency: 'PKR' } }],
    });

    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog,
    });

    render(<WebStoreApp store={store} activeRoute="store.catalog" />);

    await waitFor(() => {
      expect(screen.getByTestId('web-catalog-category-mains')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('web-catalog-category-mains'));
    expect(screen.getByTestId('web-catalog-item-biryani')).toBeTruthy();
    expect(screen.queryByTestId('web-catalog-item-chai')).toBeNull();

    fireEvent.change(screen.getByTestId('web-catalog-search'), { target: { value: 'burger' } });
    await waitFor(() => {
      expect(screen.getByTestId('web-catalog-no-results')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('web-catalog-category-all'));
    fireEvent.change(screen.getByTestId('web-catalog-search'), { target: { value: 'chai' } });
    await waitFor(() => {
      expect(screen.getByTestId('web-catalog-item-chai')).toBeTruthy();
    });
    expect(screen.queryByTestId('web-catalog-item-biryani')).toBeNull();
  });
});
