import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import { handleSupabaseError, OperationType } from './dbHelpers';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (activeUser) {
        fetchAndSubscribeProfile(activeUser.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);

      if (profileChannel) {
        supabase.removeChannel(profileChannel);
        profileChannel = null;
      }

      if (activeUser) {
        fetchAndSubscribeProfile(activeUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    function fetchAndSubscribeProfile(userId: string) {
      // Initial fetch
      supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            handleSupabaseError(error, OperationType.GET, `users/${userId}`);
          } else if (data) {
            setProfile(snakeToCamelProfile(data));
          }
          setLoading(false);
        });

      // Realtime subscription
      profileChannel = supabase
        .channel(`user-profile-${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        }, (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            setProfile(snakeToCamelProfile(payload.new as Record<string, unknown>));
          }
        })
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, []);

  return { user, profile, loading };
}

/** Convert snake_case DB row to camelCase UserProfile. */
function snakeToCamelProfile(row: Record<string, unknown>): UserProfile {
  return {
    uid: row.id as string,
    email: (row.email as string) ?? '',
    firstName: (row.first_name as string) ?? '',
    lastName: (row.last_name as string) ?? '',
    displayName: (row.display_name as string) ?? '',
    username: (row.username as string) ?? '',
    userType: (row.user_type as UserProfile['userType']) ?? 'Dog Owner',
    photoURL: row.photo_url as string | undefined,
    homeCity: row.home_city as string | undefined,
    localHub: row.local_hub as string | undefined,
    bio: row.bio as string | undefined,
    dreamDestination: row.dream_destination as string | undefined,
    referralCode: row.referral_code as string | undefined,
    referredBy: row.referred_by as string | undefined,
    memberPlan: row.member_plan as UserProfile['memberPlan'],
    membership: row.membership as UserProfile['membership'],
    onboarded: row.onboarded as boolean | undefined,
    onboardingStep: row.onboarding_step as number | undefined,
    onboardingStatus: row.onboarding_status as UserProfile['onboardingStatus'],
    emailVerified: row.email_verified as boolean | undefined,
    status: row.status as string | undefined,
    whatsOn: row.whats_on as string | undefined,
    statusUpdatedAt: row.status_updated_at as string | undefined,
    usernameChangedAt: row.username_changed_at as string[] | undefined,
    foundingMember: row.founding_member as boolean | undefined,
    communityOptIn: row.community_opt_in as boolean | undefined,
    interests: row.interests as string[] | undefined,
    appIntents: row.app_intents as string[] | undefined,
    relationshipStatus: row.relationship_status as string | undefined,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}
