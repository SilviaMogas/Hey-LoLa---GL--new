// Pet microchip validation for ISO 11784/11785 (FDX-B) and a few common
// pre-ISO US formats. Starts with Spain + United States; extend the
// COUNTRY_CODES table as new countries come online.

export type SupportedCountry = 'ES' | 'US';

export interface CountryOption {
  code: SupportedCountry;
  /** ISO 11784 numeric country code as it appears in chip prefixes. */
  iso11784: string;
  label: string;
  flag: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'ES', iso11784: '724', label: 'Spain', flag: '🇪🇸' },
  { code: 'US', iso11784: '840', label: 'United States', flag: '🇺🇸' },
];

/** Manufacturer codes (start at 900) used when no country code is asserted. */
const MANUFACTURER_PREFIXES = ['900', '981', '982', '985'];

export type MicrochipStatus = 'empty' | 'valid_match' | 'valid_other' | 'manufacturer' | 'too_short' | 'invalid';

export interface MicrochipResult {
  status: MicrochipStatus;
  /** The 3-digit prefix detected (or null). */
  prefix: string | null;
  /** Country detected from the prefix, if any. */
  detectedCountry: CountryOption | null;
  /** Plain-English message safe to show in the UI. */
  message: string;
}

/** Strip spaces / dashes so the user can paste from anywhere. */
function normalize(input: string): string {
  return input.replace(/[\s-]/g, '');
}

/**
 * Validate a microchip ID against an optional country of origin.
 * - ISO 11784/11785 chips are 15 digits.
 * - First 3 digits = country code (or 900-series manufacturer code).
 * - For US-born pets we also accept the legacy 9- or 10-digit Avid /
 *   HomeAgain / AKC formats so older rescues don't get a false negative.
 */
export function validateMicrochip(input: string, countryCode?: SupportedCountry): MicrochipResult {
  const id = normalize(input);
  if (!id) {
    return { status: 'empty', prefix: null, detectedCountry: null, message: '' };
  }

  if (!/^\d+$/.test(id)) {
    return { status: 'invalid', prefix: null, detectedCountry: null, message: 'Microchip IDs are digits only.' };
  }

  // Pre-ISO US formats (Avid 9-digit, HomeAgain/AKC 10-digit).
  if (countryCode === 'US' && (id.length === 9 || id.length === 10)) {
    return {
      status: 'valid_match',
      prefix: null,
      detectedCountry: SUPPORTED_COUNTRIES.find((c) => c.code === 'US') ?? null,
      message: `Pre-ISO US format (${id.length} digits) — recognised.`,
    };
  }

  if (id.length < 15) {
    return {
      status: 'too_short',
      prefix: null,
      detectedCountry: null,
      message: `ISO chips are 15 digits — you have ${id.length}.`,
    };
  }

  if (id.length > 15) {
    return {
      status: 'invalid',
      prefix: null,
      detectedCountry: null,
      message: `Too long: ISO chips are 15 digits, not ${id.length}.`,
    };
  }

  const prefix = id.slice(0, 3);

  if (MANUFACTURER_PREFIXES.includes(prefix)) {
    return {
      status: 'manufacturer',
      prefix,
      detectedCountry: null,
      message: `Manufacturer code ${prefix} — common in US chips, no country embedded.`,
    };
  }

  const detected = SUPPORTED_COUNTRIES.find((c) => c.iso11784 === prefix) ?? null;

  if (detected) {
    if (countryCode && countryCode !== detected.code) {
      const declared = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode);
      return {
        status: 'valid_other',
        prefix,
        detectedCountry: detected,
        message: `Chip is registered to ${detected.flag} ${detected.label} (code ${prefix}), but you selected ${declared?.flag} ${declared?.label}.`,
      };
    }
    return {
      status: 'valid_match',
      prefix,
      detectedCountry: detected,
      message: `Valid ISO chip — ${detected.flag} ${detected.label} (code ${prefix}).`,
    };
  }

  return {
    status: 'valid_other',
    prefix,
    detectedCountry: null,
    message: `Valid ISO chip — country code ${prefix} is outside the currently-supported list.`,
  };
}
