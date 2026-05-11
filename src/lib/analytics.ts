import { track as vercelTrack } from '@vercel/analytics';

export type AnalyticsEvent =
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'
  | 'email_verified'
  | 'onboarding_completed'
  | 'pet_created'
  | 'place_favorited'
  | 'place_unfavorited'
  | 'place_claimed'
  | 'community_post_created'
  | 'support_chat_opened'
  | 'support_message_sent'
  | 'business_inquiry_sent'
  | 'blog_post_opened'
  | 'softpaywall_shown'
  | 'softpaywall_converted'
  | 'city_voted'
  | 'city_unvoted'
  | 'city_suggested'
  | 'reservation_click';

type Properties = Record<string, string | number | boolean | null>;

/**
 * Fire a product-analytics event. Wraps Vercel Analytics so swapping in
 * Segment / PostHog / Mixpanel later is a single-file change.
 */
export function track(event: AnalyticsEvent, properties?: Properties): void {
  try {
    vercelTrack(event, properties as any);
  } catch (err) {
    // Never let analytics break the UX
    if (typeof window !== 'undefined' && window.console) {
      // eslint-disable-next-line no-console
      console.warn('analytics error', err);
    }
  }
}
