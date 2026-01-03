import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // Find fleets that have arrived
    const { data: fleets } = await supabase
        .from('movimientos_mapa')
        .select('id')
        .lte('llegada', new Date().toISOString());

    if (!fleets || fleets.length === 0) {
        return NextResponse.json({ processed: 0 });
    }

    let processedCount = 0;
    for (const fleet of fleets) {
        const { error } = await supabase.rpc('resolver_combate', {
            p_movimiento_id: fleet.id
        });
        if (!error) processedCount++;
    }

    return NextResponse.json({ processed: processedCount });
}
