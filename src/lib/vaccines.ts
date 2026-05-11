// Country-specific vaccine schedules used by the onboarding "medical
// records" step. We surface the required vaccines for the pet's country
// of origin filtered by age, so the user can tick off what's already
// done instead of writing every entry from scratch.

import type { SupportedCountry } from './microchip';
import type { Activity } from '../types';

export interface VaccineDef {
  /** Stable ID — used for the saved vaccination record. */
  id: string;
  name: string;
  /** One-line plain-English explanation. */
  description: string;
  /** Earliest age (in weeks) at which this vaccine is normally given. */
  fromWeeks: number;
  /** Mandatory by law / for travel, vs. recommended. */
  required: boolean;
  /** How often it needs a booster. */
  recurring?: 'annual' | '3y';
  /** Lifestyle traits that bump this from "recommended" to "strongly suggested". */
  triggeredBy?: Activity[];
}

export const VACCINES_BY_COUNTRY: Record<SupportedCountry, VaccineDef[]> = {
  ES: [
    { id: 'rabies',  name: 'Rabia',                 description: 'Obligatoria por ley a partir de las 12 semanas. Imprescindible para viajar.', fromWeeks: 12, required: true,  recurring: '3y',     triggeredBy: ['travel'] },
    { id: 'dhppi',   name: 'Polivalente (DHPPi)',   description: 'Moquillo, hepatitis, parvovirus y parainfluenza.',                              fromWeeks: 6,  required: true,  recurring: 'annual' },
    { id: 'lepto',   name: 'Leptospirosis',         description: 'Recomendada anualmente, especialmente en zonas con agua estancada.',           fromWeeks: 8,  required: false, recurring: 'annual', triggeredBy: ['rural', 'swimming', 'hiking'] },
    { id: 'kennel',  name: 'Tos de las perreras',   description: 'Bordetella — necesaria para residencias y guarderías caninas.',                 fromWeeks: 8,  required: false, recurring: 'annual', triggeredBy: ['boarding', 'daycare'] },
  ],
  US: [
    { id: 'rabies',  name: 'Rabies',                description: 'Required by law in most US states. First shot at 12–16 weeks.',                fromWeeks: 12, required: true,  recurring: '3y',     triggeredBy: ['travel'] },
    { id: 'dhpp',    name: 'DHPP',                  description: 'Distemper, hepatitis, parvovirus, parainfluenza — core puppy series.',         fromWeeks: 6,  required: true,  recurring: 'annual' },
    { id: 'bordetella', name: 'Bordetella',         description: 'Kennel cough. Required by most boarding & daycare facilities.',                 fromWeeks: 8,  required: false, recurring: 'annual', triggeredBy: ['boarding', 'daycare'] },
    { id: 'lepto',   name: 'Leptospirosis',         description: 'Recommended for outdoor or rural dogs.',                                       fromWeeks: 12, required: false, recurring: 'annual', triggeredBy: ['rural', 'hiking', 'swimming'] },
    { id: 'lyme',    name: 'Lyme disease',          description: 'Recommended in tick-heavy regions (Northeast, upper Midwest).',                fromWeeks: 12, required: false, recurring: 'annual', triggeredBy: ['hiking', 'rural'] },
  ],
};

/** Age in whole weeks given an ISO date string ("YYYY-MM-DD"). Returns 0 if no DOB. */
export function ageWeeks(birthDateISO?: string): number {
  if (!birthDateISO) return 0;
  const dob = new Date(birthDateISO).getTime();
  if (Number.isNaN(dob)) return 0;
  const ms = Date.now() - dob;
  return Math.max(0, Math.floor(ms / (7 * 24 * 60 * 60 * 1000)));
}

/** Vaccines that already apply to the pet's age. Country-agnostic when no country chosen. */
export function applicableVaccines(country?: SupportedCountry, birthDateISO?: string): VaccineDef[] {
  if (!country) return [];
  const weeks = ageWeeks(birthDateISO);
  // If we don't know the age yet, show all (better to over-suggest than miss any).
  return VACCINES_BY_COUNTRY[country].filter((v) => weeks === 0 || weeks >= v.fromWeeks);
}
