'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { MapTileData } from "@/lib/services/game.service";
import { useEffect } from "react";
  
type CityMapProps = {
    tiles: MapTileData[];
};
  
const tileColorClasses = {
    empty: "bg-gray-500",
    occupied: "bg-blue-600",
    own: "bg-green-600",
    enemy: "bg-orange-500", // Future use
};

const TOTAL_TILES = 225; // 15x15

export function CityMap({ tiles }: CityMapProps) {
    // We need to inject the style only once in client
    useEffect(() => {
        if (!document.getElementById('grid-cols-15-style')) {
            const style = document.createElement('style');
            style.id = 'grid-cols-15-style';
            style.innerHTML = `
            .grid-cols-15 {
                grid-template-columns: repeat(15, minmax(0, 1fr));
            }
            `;
            document.head.appendChild(style);
        }
    }, []);

    // Create a map of 225 slots
    // coordinate_edificio is 1-based, array is 0-based.
    // So slot index i corresponds to coordinate_edificio i + 1.
    const gridTiles = Array.from({ length: TOTAL_TILES }, (_, i) => {
        const coordinate = i + 1;
        const data = tiles.find(t => t.coordenada_edificio === coordinate);
        return {
            id: i,
            coordinate,
            data,
            type: data ? (data.es_propia ? 'own' : 'occupied') : 'empty',
        };
    });

    return (
        <TooltipProvider>
            <div className="w-full aspect-square max-w-[600px] bg-stone-800 p-2 rounded-md">
                <div className="grid grid-cols-15 gap-1 w-full h-full">
                    {gridTiles.map((tile) => (
                        <Tooltip key={tile.id}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "w-full h-full border border-dashed border-white/20 transition-all hover:brightness-110",
                                    tileColorClasses[tile.type as keyof typeof tileColorClasses],
                                    tile.data?.es_propia && "ring-2 ring-yellow-400"
                                )}>
                                    {/* Optional: Add small indicator for something */}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-yellow-100 text-black border-yellow-300 z-50">
                                {tile.data ? (
                                    <>
                                        <p className="font-bold">Edificio {tile.coordinate}</p>
                                        <p>Dueño: {tile.data.nombre_usuario}</p>
                                        <p>Puntos: {tile.data.puntos}</p>
                                        {tile.data.nombre_familia && (
                                            <p className="text-xs text-stone-600">[{tile.data.etiqueta_familia}] {tile.data.nombre_familia}</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold">Edificio {tile.coordinate}</p>
                                        <p className="text-stone-500">Espacio vacío</p>
                                    </>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
