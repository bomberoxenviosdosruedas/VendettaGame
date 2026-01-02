'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const EnqueueSchema = z.object({
  baseId: z.string().uuid(),
  buildingId: z.string().min(1),
});

const CancelSchema = z.object({
  queueId: z.string().uuid(),
});

export async function enqueueBuildingUpgrade(baseId: string, buildingId: string) {
  const supabase = await createClient(); // Await createClient in Next.js 15

  const validated = EnqueueSchema.safeParse({ baseId, buildingId });
  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const { error, data } = await supabase.rpc('enqueue_building_upgrade', {
    p_base_id: baseId,
    p_building_id: buildingId,
  });

  if (error) {
    console.error('RPC Error:', error);
    return { error: 'Database error occurred' };
  }

  // RPC returns { error: '...' } or { success: true }
  // We need to check the JSON result
  if (data && typeof data === 'object' && 'error' in data) {
    return { error: (data as any).error };
  }

  revalidatePath('/dashboard/buildings');
  return { success: true };
}

export async function cancelBuildingUpgrade(queueId: string) {
  const supabase = await createClient();

  const validated = CancelSchema.safeParse({ queueId });
  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const { error, data } = await supabase.rpc('cancel_building_upgrade', {
    p_queue_id: queueId,
  });

  if (error) {
    console.error('RPC Error:', error);
    return { error: 'Database error occurred' };
  }

  if (data && typeof data === 'object' && 'error' in data) {
    return { error: (data as any).error };
  }

  revalidatePath('/dashboard/buildings');
  return { success: true };
}
