import { MapControls } from "@/components/dashboard/map/map-controls";
import { CityMap } from "@/components/dashboard/map/city-map";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { mapData } from "@/lib/data/map-data";

export default function MapPage() {
    return (
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">
                    Mappa della città
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center gap-4">
                <MapControls />
                <CityMap tiles={mapData} />
            </CardContent>
        </Card>
    );
}
