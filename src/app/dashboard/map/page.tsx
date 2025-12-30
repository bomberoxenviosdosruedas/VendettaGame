
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

    let userProperty = null;
    let dashboardData = null;

    // Fetch user property to determine origin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const propertyId = await getUserProperty(user.id);
        if (propertyId) {
            dashboardData = await getDashboardData(propertyId);
            if (dashboardData) {
                userProperty = {
                    city: dashboardData.propiedad.coordenada_ciudad,
                    district: dashboardData.propiedad.coordenada_barrio,
                    building: dashboardData.propiedad.coordenada_edificio
                };

                // If coordinates are missing from URL, use user's location
                if (city === null || district === null) {
                    city = userProperty.city;
                    district = userProperty.district;
                }
            }
        }
    }

    // Default fallbacks if user has no property or something fails
    const currentCity = city ?? 1;
    const currentDistrict = district ?? 1;

    const tilesData = await getMapTiles(currentCity, currentDistrict);

    return (
        <Card className="border-primary bg-stone-950 text-stone-100 min-h-[calc(100vh-8rem)]">
            <CardHeader className="bg-stone-900/50 py-3 px-6 border-b border-stone-800">
                <CardTitle className="text-xl text-amber-500 tracking-tight flex items-center justify-between">
                    <span>Mapa Táctico</span>
                    <span className="text-sm font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded">
                        Sector {currentCity}:{currentDistrict}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center gap-0">
                <div className="w-full bg-stone-900/30 p-4 border-b border-stone-800 flex justify-center">
                    <MapControls currentCity={currentCity} currentDistrict={currentDistrict} />
                </div>
                <div className="w-full flex-1 p-6 flex justify-center items-start bg-[url('/grid-bg.png')] bg-repeat overflow-auto">
                    <CityMap
                        tiles={tilesData}
                        currentCity={currentCity}
                        currentDistrict={currentDistrict}
                        userProperty={userProperty}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
