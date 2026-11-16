import { PlatformApiException } from '../errors.js';
import type {
  PlatformOrderCreateHttpBody,
  PlatformOrderCreateInput,
  PlatformOrderLineDto,
  PlatformOrderPatchHttpBody,
  PlatformOrderPatchInput,
  PlatformOrderStatus,
} from '../types.js';

const ORDER_STATUSES: readonly PlatformOrderStatus[] = [
  'placed',
  'confirmed',
  'fulfilled',
  'cancelled',
];

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new PlatformApiException(`${field} is required.`, 400);
  }
  return value.trim();
}

function optionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseNonNegativeInt(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new PlatformApiException(`${field} must be a non-negative number.`, 400);
  }
  return Math.round(value);
}

function parsePositiveInt(value: unknown, field: string): number {
  const n = parseNonNegativeInt(value, field);
  if (n < 1) {
    throw new PlatformApiException(`${field} must be at least 1.`, 400);
  }
  return n;
}

function parseLine(raw: unknown, index: number): PlatformOrderLineDto {
  if (!raw || typeof raw !== 'object') {
    throw new PlatformApiException(`lines[${index}] must be an object.`, 400);
  }
  const line = raw as Record<string, unknown>;
  const sku = requireNonEmptyString(line.sku, `lines[${index}].sku`);
  const title = requireNonEmptyString(line.title, `lines[${index}].title`);
  const quantity = parsePositiveInt(line.quantity, `lines[${index}].quantity`);
  const unitAmount = parseNonNegativeInt(line.unitAmount, `lines[${index}].unitAmount`);
  const currency = (optionalTrimmedString(line.currency) ?? 'PKR').toUpperCase();
  const lineAmount =
    line.lineAmount === undefined
      ? unitAmount * quantity
      : parseNonNegativeInt(line.lineAmount, `lines[${index}].lineAmount`);

  return { sku, title, quantity, unitAmount, lineAmount, currency };
}

/** Parse and validate POST order JSON body. */
export function parsePlatformOrderCreateBody(
  body: PlatformOrderCreateHttpBody,
): PlatformOrderCreateInput {
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    throw new PlatformApiException('lines must be a non-empty array.', 400);
  }
  const lines = body.lines.map((line, index) => parseLine(line, index));
  const currency = (optionalTrimmedString(body.currency) ?? lines[0]!.currency).toUpperCase();
  return {
    lines,
    currency,
    customerName: optionalTrimmedString(body.customerName),
    note: optionalTrimmedString(body.note),
    id: optionalTrimmedString(body.id),
  };
}

/** Parse and validate PATCH order JSON body. */
export function parsePlatformOrderPatchBody(
  body: PlatformOrderPatchHttpBody,
): PlatformOrderPatchInput {
  const statusRaw = requireNonEmptyString(body.status, 'status');
  if (!(ORDER_STATUSES as readonly string[]).includes(statusRaw)) {
    throw new PlatformApiException(`status must be one of: ${ORDER_STATUSES.join(', ')}.`, 400);
  }
  return { status: statusRaw as PlatformOrderStatus };
}

/** Allowed status transitions for the merchant demo order loop. */
export function assertOrderStatusTransition(
  from: PlatformOrderStatus,
  to: PlatformOrderStatus,
): void {
  if (from === to) {
    return;
  }
  const allowed: Record<PlatformOrderStatus, readonly PlatformOrderStatus[]> = {
    placed: ['confirmed', 'cancelled'],
    confirmed: ['fulfilled', 'cancelled'],
    fulfilled: [],
    cancelled: [],
  };
  if (!allowed[from].includes(to)) {
    throw new PlatformApiException(`Cannot transition order from '${from}' to '${to}'.`, 409);
  }
}
