import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';

import {
  createCatalogProductViaPlatformApi,
  deleteCatalogProductViaPlatformApi,
  fetchTenantCatalogViaPlatformApi,
  patchCatalogProductViaPlatformApi,
  PlatformClientError,
  type PlatformCatalogProduct,
} from './platform-client.js';

export interface PlatformCatalogEditorProps {
  tenantId: string;
  tenantSlug: string;
  onProductsChanged?: (products: PlatformCatalogProduct[]) => void;
}

/**
 * Merchant catalog CRUD against platform-api (Sprint 29 Task 3).
 * Storefront picks up changes on next boot / refresh of /t/:slug.
 */
export function PlatformCatalogEditor(props: PlatformCatalogEditorProps): ReactNode {
  const { tenantId, tenantSlug, onProductsChanged } = props;
  const [products, setProducts] = useState<PlatformCatalogProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [title, setTitle] = useState('Unit');
  const [amount, setAmount] = useState('100');

  const refresh = useCallback(async () => {
    setError(null);
    const catalog = await fetchTenantCatalogViaPlatformApi(tenantId);
    setProducts(catalog.products);
    onProductsChanged?.(catalog.products);
  }, [tenantId, onProductsChanged]);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    void refresh().catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load catalog.');
        setProducts([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createCatalogProductViaPlatformApi(tenantId, {
        name: name.trim(),
        sku: sku.trim(),
        title: title.trim() || 'Unit',
        amount: Number(amount),
      });
      setName('');
      setSku('');
      setTitle('Unit');
      setAmount('100');
      await refresh();
    } catch (err: unknown) {
      setError(
        err instanceof PlatformClientError || err instanceof Error ? err.message : 'Create failed.',
      );
    } finally {
      setBusy(false);
    }
  };

  const onSaveAmount = async (product: PlatformCatalogProduct, nextAmount: string) => {
    const parsed = Number(nextAmount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Amount must be a non-negative number.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await patchCatalogProductViaPlatformApi(tenantId, product.id, { amount: parsed });
      await refresh();
    } catch (err: unknown) {
      setError(
        err instanceof PlatformClientError || err instanceof Error ? err.message : 'Update failed.',
      );
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (product: PlatformCatalogProduct) => {
    setBusy(true);
    setError(null);
    try {
      await deleteCatalogProductViaPlatformApi(tenantId, product.id);
      await refresh();
    } catch (err: unknown) {
      setError(
        err instanceof PlatformClientError || err instanceof Error ? err.message : 'Delete failed.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="catalog-editor" data-testid="platform-catalog-editor">
      <p className="catalog-editor-hint">
        Edits save to platform-api. Storefront: open <code>/t/{tenantSlug}</code> (or refresh) to
        see changes.
      </p>

      <form
        className="catalog-create"
        onSubmit={(e) => void onCreate(e)}
        data-testid="catalog-create"
      >
        <h3>Add product</h3>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-testid="catalog-create-name"
          />
        </label>
        <label>
          SKU
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            data-testid="catalog-create-sku"
          />
        </label>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Amount
          <input
            type="number"
            min={0}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            data-testid="catalog-create-amount"
          />
        </label>
        <button type="submit" disabled={busy} data-testid="catalog-create-submit">
          Create
        </button>
      </form>

      {error ? (
        <p className="catalog-editor-error" data-testid="catalog-editor-error">
          {error}
        </p>
      ) : null}

      {products === null ? (
        <p data-testid="catalog-editor-loading">Loading products…</p>
      ) : products.length === 0 ? (
        <p data-testid="catalog-editor-empty">No products yet.</p>
      ) : (
        <table className="catalog-table" data-testid="catalog-editor-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} data-testid={`catalog-row-${product.slug}`}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>
                  <AmountCell
                    amount={product.amount}
                    disabled={busy}
                    onSave={(value) => void onSaveAmount(product, value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onDelete(product)}
                    data-testid={`catalog-delete-${product.slug}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AmountCell(props: {
  amount: number;
  disabled: boolean;
  onSave: (value: string) => void;
}): ReactNode {
  const [value, setValue] = useState(String(props.amount));
  useEffect(() => {
    setValue(String(props.amount));
  }, [props.amount]);

  return (
    <span className="catalog-amount-cell">
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        disabled={props.disabled}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="button" disabled={props.disabled} onClick={() => props.onSave(value)}>
        Save
      </button>
    </span>
  );
}
