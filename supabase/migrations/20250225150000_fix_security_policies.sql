-- Migration to fix security policies (RLS) for alliance_members, base_buildings, and base_units.
-- These tables were enabled for RLS but lacked policies, creating a fail-closed or insecure state.

BEGIN;

-- 1. public.alliance_members
-- -----------------------------------------------------------------------------
-- Allow public read access (e.g., to see who is in an alliance)
CREATE POLICY "Public read alliance members" ON public.alliance_members
    FOR SELECT
    USING (true);

-- Allow users to manage their own membership (e.g., leave alliance)
-- Note: Further policies might be needed for Alliance Leaders to manage other members.
CREATE POLICY "Manage own alliance membership" ON public.alliance_members
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. public.base_buildings
-- -----------------------------------------------------------------------------
-- Allow public read access (e.g., for espionage or visiting profiles)
CREATE POLICY "Public read base buildings" ON public.base_buildings
    FOR SELECT
    USING (true);

-- Allow base owners to insert, update, or delete buildings in their bases
CREATE POLICY "Manage own base buildings" ON public.base_buildings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.bases
            WHERE bases.id = base_buildings.base_id
            AND bases.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bases
            WHERE bases.id = base_buildings.base_id
            AND bases.user_id = auth.uid()
        )
    );


-- 3. public.base_units
-- -----------------------------------------------------------------------------
-- Allow public read access (e.g., for espionage)
CREATE POLICY "Public read base units" ON public.base_units
    FOR SELECT
    USING (true);

-- Allow base owners to manage units in their bases
CREATE POLICY "Manage own base units" ON public.base_units
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.bases
            WHERE bases.id = base_units.base_id
            AND bases.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bases
            WHERE bases.id = base_units.base_id
            AND bases.user_id = auth.uid()
        )
    );

COMMIT;
