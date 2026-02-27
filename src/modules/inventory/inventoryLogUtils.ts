export type InventoryVerb = 'add' | 'subtract' | 'set';

export function inferInventoryVerb(
  prevQty: number | null | undefined,
  newQty: number
): InventoryVerb {
  if (prevQty === null || prevQty === undefined) {
    return 'set';
  }

  if (newQty > prevQty) {
    return 'add';
  }

  if (newQty < prevQty) {
    return 'subtract';
  }

  return 'set';
}

interface QuantityLogParams {
  displayName: string;
  itemName: string;
  unit: string;
  prevQty: number;
  newQty: number;
  /** When provided, use this verb instead of inferring from prev/new qty (e.g. "set" for form save). */
  verb?: InventoryVerb;
}

export function formatInventoryQuantityLogMessage({
  displayName,
  itemName,
  unit,
  prevQty,
  newQty,
  verb: verbOverride
}: QuantityLogParams): string {
  const verb = verbOverride ?? inferInventoryVerb(prevQty, newQty);
  const delta = newQty - prevQty;
  const absDelta = Math.abs(delta);

  const formattedDelta =
    Number.isInteger(absDelta) ? absDelta.toString() : absDelta.toString();
  const formattedPrev =
    Number.isInteger(prevQty) ? prevQty.toString() : prevQty.toString();
  const formattedNew =
    Number.isInteger(newQty) ? newQty.toString() : newQty.toString();

  if (verb === 'add') {
    return `${displayName} added ${formattedDelta} ${unit} to ${itemName}. (Prev: ${formattedPrev} ${unit}. New: ${formattedNew} ${unit})`;
  }

  if (verb === 'subtract') {
    return `${displayName} subtracted ${formattedDelta} ${unit} from ${itemName}. (Prev: ${formattedPrev} ${unit}. New: ${formattedNew} ${unit})`;
  }

  // set
  return `${displayName} set ${itemName} to ${formattedNew} ${unit}. (Prev: ${formattedPrev} ${unit}. New: ${formattedNew} ${unit})`;
}

interface FieldChangeLogParams {
  displayName: string;
  itemName: string;
  fieldLabel: string;
  prevValue: string | number | null;
  newValue: string | number | null;
}

function formatFieldValue(value: string | number | null): string {
  if (value === null || value === undefined) {
    return '(none)';
  }

  if (typeof value === 'string') {
    return `"${value}"`;
  }

  return value.toString();
}

export function formatInventoryFieldChangeLogMessage({
  displayName,
  itemName,
  fieldLabel,
  prevValue,
  newValue
}: FieldChangeLogParams): string {
  const formattedPrev = formatFieldValue(prevValue);
  const formattedNew = formatFieldValue(newValue);

  return `${displayName} changed ${fieldLabel} of ${itemName} from ${formattedPrev} to ${formattedNew}`;
}

