import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Place, ReservationClick } from '../types';
import { track } from './analytics';

/**
 * Append `?ref=heylola` (or merge with existing query) so OpenTable receives
 * an attribution signal for every outbound click.
 */
export const buildOpenTableUrl = (rawUrl: string, place: Place): string => {
  try {
    const url = new URL(rawUrl);
    if (!url.searchParams.has('ref')) url.searchParams.set('ref', 'heylola');
    if (place.reservationCampaignId && !url.searchParams.has('utm_campaign')) {
      url.searchParams.set('utm_campaign', place.reservationCampaignId);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
};

export async function logReservationClick(place: Place): Promise<void> {
  const event: ReservationClick = {
    venueId: place.id,
    venueName: place.name,
    city: place.city,
    userId: auth.currentUser?.uid,
    timestamp: new Date().toISOString(),
    source: 'heylola',
    action: 'opentable_reservation_click',
    provider: place.reservationProvider ?? 'OpenTable',
    affiliateId: place.reservationAffiliateId,
    campaignId: place.reservationCampaignId,
    referralCode: place.reservationReferralCode,
  };
  // Strip undefined fields — Firestore stores them as `null` otherwise.
  const payload: Record<string, unknown> = {};
  Object.entries(event).forEach(([k, v]) => {
    if (v !== undefined) payload[k] = v;
  });
  try {
    await addDoc(collection(db, 'reservation_clicks'), payload);
  } catch (err) {
    console.error('Failed to log reservation click', err);
  }
  track('reservation_click', {
    venueId: place.id,
    venueName: place.name,
    city: place.city,
    provider: event.provider,
  });
}
