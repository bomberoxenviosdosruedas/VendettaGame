import { MapControls } from "@/components/dashboard/map/map-controls";
import { CityMap } from "@/components/dashboard/map/city-map";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { getMapTiles, getUserProperty, getDashboardData, MapTileData } from "@/lib/services/game.service";
import { createClient } from '@/lib/supabase/server';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function MapPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams;
    let city = params.city ? parseInt(params.city as string) : null;
    let district = params.district ? parseInt(params.district as string) : null;

    // If coordinates are missing, fetch user's current location
    if (city === null || district === null) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const propertyId = await getUserProperty(user.id);
            if (propertyId) {
                const dashboardData = await getDashboardData(propertyId);
                if (dashboardData) {
                    city = city ?? dashboardData.propiedad.coordenada_ciudad;
                    district = district ?? dashboardData.propiedad.coordenada_barrio;
                }
            }
        }
    }

    // Default fallbacks if user has no property or something fails
    const currentCity = city ?? 1;
    const currentDistrict = district ?? 1;

    const tilesData = await getMapTiles(currentCity, currentDistrict);

    return (
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">
                    Mapa de la ciudad - Ciudad {currentCity}, Barrio {currentDistrict}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center gap-4">
                <MapControls currentCity={currentCity} currentDistrict={currentDistrict} />
                <CityMap tiles={tilesData} />
            </CardContent>
        </Card>
    );
}
