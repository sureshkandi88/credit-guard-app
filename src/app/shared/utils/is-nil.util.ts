/**
 * Checks if a value is null or undefined
 * @param value The value to check
 * @returns Boolean indicating if the value is null or undefined
 */
export function isNil(value: any): boolean {
  return value === null || value === undefined;
}
