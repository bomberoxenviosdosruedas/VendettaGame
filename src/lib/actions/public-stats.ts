'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

export async function getPublicStats() {
  const supabase = await createClient();

  // Registered Count
  const { count: registeredCount, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error fetching registered count:', countError);
  }

  // Online Count (Active in last 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: onlineCount, error: onlineError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gt('last_active_at', tenMinutesAgo);

  if (onlineError) {
    console.error('Error fetching online count:', onlineError);
  }

  return {
    registered: registeredCount || 0,
    online: onlineCount || 0,
  };
}

export async function getTopPlayers(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('username, total_points, ranking_position')
    .order('ranking_position', { ascending: true }) // Assuming 1 is top
    .limit(limit);

  if (error) {
    console.error('Error fetching top players:', error);
    return [];
  }

  return data;
}
