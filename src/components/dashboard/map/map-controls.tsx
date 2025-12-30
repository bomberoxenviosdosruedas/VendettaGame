"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MapControlsProps {
    currentCity: number;
    currentDistrict: number;
}

export function MapControls({ currentCity, currentDistrict }: MapControlsProps) {
    const router = useRouter();
    const [city, setCity] = useState(currentCity);
    const [district, setDistrict] = useState(currentDistrict);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/dashboard/map?city=${city}&district=${district}`);
    };

    return (
        <div className="bg-stone-300/80 p-4 rounded-md border border-primary/30 w-full max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="city" className="text-sm">Ciudad</Label>
                        <Input
                            id="city"
                            type="number"
                            min={1}
                            value={city}
                            onChange={(e) => setCity(parseInt(e.target.value) || 0)}
                            className="w-20 h-8 bg-white text-black"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="neighborhood" className="text-sm">Barrio</Label>
                        <Input
                            id="neighborhood"
                            type="number"
                            min={1}
                            value={district}
                            onChange={(e) => setDistrict(parseInt(e.target.value) || 0)}
                            className="w-20 h-8 bg-white text-black"
                        />
                    </div>
                </div>
                <Button type="submit" variant="outline" size="sm" className="h-8 bg-white text-black hover:bg-stone-100">Ir</Button>
            </form>
        </div>
    );
}
