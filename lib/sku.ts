export const SKU_MAX_LENGTH = 64;

/** Empty codes remain optional; preserve leading zeros and letter case. */
export function parseSku(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new Error('Informe o SKU como texto.');
  const sku = value.trim();
  if (sku.length > SKU_MAX_LENGTH || /[\u0000-\u001f\u007f]/.test(sku)) {
    throw new Error('Use um SKU de até 64 caracteres, sem quebras de linha.');
  }
  return sku || null;
}
