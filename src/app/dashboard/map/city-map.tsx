'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import type { Tile } from "./map-data";
  
type CityMapProps = {
    tiles: Tile[];
};
  
const tileColorClasses = {
    gray: "bg-gray-500",
    green: "bg-green-600",
    blue: "bg-blue-600",
    orange: "bg-orange-500",
};

export function CityMap({ tiles }: CityMapProps) {
    return (
        <TooltipProvider>
            <div className="w-full aspect-square max-w-[600px] bg-stone-800 p-2 rounded-md">
                <div className="grid grid-cols-15 gap-1 w-full h-full">
                    {tiles.map((tile) => (
                        <Tooltip key={tile.id}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "w-full h-full border border-dashed border-white/20",
                                    tileColorClasses[tile.type as keyof typeof tileColorClasses],
                                    tile.isCenter && "ring-2 ring-red-500"
                                )}>
                                    {tile.isCenter && (
                                        <div className="relative w-full h-full">
                                            <span className="absolute top-0 left-0 bg-red-600 text-white text-[8px] leading-none px-0.5">1</span>
                                            <span className="absolute top-0 right-0 bg-red-600 text-white text-[8px] leading-none px-0.5">1</span>
                                        </div>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-yellow-100 text-black border-yellow-300">
                                {tile.info ? (
                                    <>
                                        <p className="font-bold">Posición {tile.info.position}</p>
                                        <p>{tile.info.owner}</p>
                                        <p>{tile.info.points} Puntos</p>
                                    </>
                                ) : (
                                    <p>Posición vacía</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}

// Extend Tailwind config for 15 columns
// Add to tailwind.config.ts -> theme.extend.gridTemplateColumns
// '15': 'repeat(15, minmax(0, 1fr))',
// For this specific component, we will use inline style in the grid div
// to avoid modifying the global config for a single use case.
// The grid-cols-15 class is not standard in Tailwind, so we'll use a direct style.
// Let's create it on the file.
const style = document.createElement('style');
style.innerHTML = `
  .grid-cols-15 {
    grid-template-columns: repeat(15, minmax(0, 1fr));
  }
`;
document.head.appendChild(style);
