
import { SupabaseClient } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';

export async function routeAfterLogin(
  supabase: SupabaseClient,
  navigate: NavigateFunction,
  userId: string | undefined
) {
  if (!userId) {
    console.warn('routeAfterLogin: No user ID provided, defaulting to /dashboard');
    navigate('/dashboard');
    return;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile for routing:', error);
      // If profile doesn't exist yet (e.g., trigger hasn't run or failed), default to team_lead behavior
      // Or if the role is not set yet.
      if (error.code === 'PGRST116') { // "Cannot read property 'role' of null" or "JSON object requested, multiple (or no) rows returned"
         console.warn('Profile not found or role not set, defaulting to /dashboard for user:', userId);
      }
      navigate('/dashboard'); 
      return;
    }
    
    console.log('User profile for routing:', profile);

    switch (profile?.role) {
      case 'showing_agent':
        navigate('/showings');
        break;
      case 'lo_assistant':
        navigate('/lo-dashboard');
        break;
      case 'team_lead':
        navigate('/dashboard');
        break;
      default:
        console.warn(`Unknown or missing role "${profile?.role}", defaulting to /dashboard for user:`, userId);
        navigate('/dashboard');
    }
  } catch (e) {
    console.error('Exception in routeAfterLogin:', e);
    navigate('/dashboard'); // Default redirect on unexpected error
  }
}
