import type { UserProfile, PetData, MemberPlan } from '../types';
import {
  LEVELS,
  NEXT_ACTIONS,
  VERIFICATION_COPY,
  RECORDS_COPY,
  CITY_REWARDS_COPY,
  type LevelId,
  type LevelInfo,
  type VerificationStatus,
} from '../data/levels';

export type { LevelId, LevelInfo, VerificationStatus };

const PAID_PLANS: MemberPlan[] = ['local', 'plus', 'black'];
const PASSPORT_PLANS: MemberPlan[] = ['plus', 'black'];

const hasNonEmpty = (s?: string | null) => !!(s && s.trim().length > 0);
const hasArray = (v: unknown) => Array.isArray(v) && v.length > 0;

function petRecordsScore(pet?: PetData): number {
  if (!pet) return 0;
  return Number(!!pet.name)
    + Number(!!pet.breed)
    + Number(!!pet.birthDate)
    + Number(hasNonEmpty(pet.microchipID))
    + Number(hasArray(pet.vaccinations));
}

const hasTrustRecords = (pets: PetData[]) =>
  pets.some(p => hasNonEmpty(p.microchipID) || hasArray(p.vaccinations));

const hasPassportProfile = (pets: PetData[]) =>
  pets.some(p => !!p.birthDate && hasNonEmpty(p.microchipID) && hasArray(p.vaccinations));

export interface MembershipDerived {
  level: LevelInfo;
  recordsScore: number;
  recordsPercent: number;
  verification: VerificationStatus;
  verificationCopy: string;
  recordsCopy: string;
  nextActionTitle: string;
  nextActionCopy: string;
  cityRewardsCopy: string;
}

export function getMembershipDerived(
  profile: UserProfile | null | undefined,
  pets: PetData[],
  isAdmin: boolean = false,
): MembershipDerived {
  const memberPlan = profile?.memberPlan ?? 'free';
  const isPaid = PAID_PLANS.includes(memberPlan);
  const isPassportTier = PASSPORT_PLANS.includes(memberPlan);
  const hasPet = pets.length > 0;
  const trustRecords = hasTrustRecords(pets);
  const passportReady = hasPassportProfile(pets);

  let levelId: LevelId = 1;
  if (hasPet && isPaid) levelId = 2;
  if (trustRecords) levelId = 3;
  if (isPassportTier && passportReady) levelId = 4;

  const recordsScore = petRecordsScore(pets[0]);
  const recordsPercent = Math.round((recordsScore / 5) * 100);

  // Verification — never lies. "Verified" only when checked.
  let verification: VerificationStatus;
  let verificationCopy: string;
  if (isAdmin) {
    verification = 'Verified';
    verificationCopy = VERIFICATION_COPY.admin;
  } else if (passportReady && isPaid) {
    verification = 'Verified';
    verificationCopy = VERIFICATION_COPY.passportReady;
  } else if (hasPet && trustRecords) {
    verification = 'Not verified';
    verificationCopy = VERIFICATION_COPY.notVerified;
  } else {
    verification = 'Pending verification';
    verificationCopy = hasPet ? VERIFICATION_COPY.pendingWithPet : VERIFICATION_COPY.pendingNoPet;
  }

  const recordsCopy = !hasPet
    ? RECORDS_COPY.noPet
    : trustRecords
      ? RECORDS_COPY.partial(recordsPercent)
      : RECORDS_COPY.starting;

  // Next-best-action ladder. First unmet condition wins.
  const action =
    !profile?.firstName ? NEXT_ACTIONS.needsProfile :
    !hasPet ? NEXT_ACTIONS.needsPet :
    !isPaid ? NEXT_ACTIONS.needsPaid :
    !trustRecords ? NEXT_ACTIONS.needsTrust :
    !isPassportTier ? NEXT_ACTIONS.needsPassportTier :
    !passportReady ? NEXT_ACTIONS.needsPassportProfile :
    NEXT_ACTIONS.fullyUnlocked;

  return {
    level: LEVELS[levelId],
    recordsScore,
    recordsPercent,
    verification,
    verificationCopy,
    recordsCopy,
    nextActionTitle: action.title,
    nextActionCopy: action.copy,
    cityRewardsCopy: isPaid ? CITY_REWARDS_COPY.unlocked : CITY_REWARDS_COPY.locked,
  };
}
