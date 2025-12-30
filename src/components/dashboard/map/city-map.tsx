
'use client'

import { MapTileData } from "@/lib/services/game.service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useState, useMemo } from 'react'
import { useRouter } from "next/navigation"
import { TileDetailsDialog } from "./tile-details-dialog"
import { User, Shield, AlertTriangle } from "lucide-react"

interface CityMapProps {
  tiles: MapTileData[]
  currentCity: number
  currentDistrict: number
  userProperty: {
    city: number
    district: number
    building: number
  } | null
}

export function CityMap({ tiles, currentCity, currentDistrict, userProperty }: CityMapProps) {
  const router = useRouter()
  const [selectedTile, setSelectedTile] = useState<MapTileData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Memoize the grid generation to avoid re-renders
  // Grid is 17 columns x 15 rows (255 tiles total)
  const gridCells = useMemo(() => {
    const cells = [];
    const occupiedTiles = new Map(tiles.map(t => [t.coordenada_edificio, t]));

    for (let i = 1; i <= 255; i++) {
      const tileData = occupiedTiles.get(i);
      cells.push({
        id: i,
        data: tileData || null
      });
    }
    return cells;
  }, [tiles]);

  const handleTileClick = (id: number, tileData: MapTileData | null) => {
    if (tileData) {
      if (tileData.es_propia) {
        // Redirect to overview if it's my own property
        router.push('/dashboard/overview');
      } else {
        // Open dialog for other occupied properties
        setSelectedTile(tileData);
        setIsDialogOpen(true);
      }
    } else {
      // Create a virtual "Empty" tile data for the dialog
      const emptyTile: MapTileData = {
        propiedad_id: '',
        coordenada_edificio: id,
        usuario_id: '00000000-0000-0000-0000-000000000000', // Empty GUID
        nombre_usuario: 'Desocupado',
        nombre_familia: null,
        etiqueta_familia: null,
        puntos: 0,
        es_propia: false
      };
      setSelectedTile(emptyTile);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div
        className="grid gap-1 w-fit bg-stone-900/80 p-2 rounded-xl border border-stone-800 shadow-2xl"
        style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }}
      >
        <TooltipProvider delayDuration={100}>
          {gridCells.map((cell) => {
            const isOccupied = !!cell.data;
            const isOwn = cell.data?.es_propia;
            const hasFamily = !!cell.data?.nombre_familia;

            return (
              <Tooltip key={cell.id}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleTileClick(cell.id, cell.data)}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 border rounded-sm transition-all duration-200 cursor-pointer flex items-center justify-center relative overflow-hidden group",
                      isOwn
                        ? "bg-green-900/40 border-green-600 hover:bg-green-800/60 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        : isOccupied
                          ? "bg-stone-800 border-stone-600 hover:bg-stone-700 hover:border-amber-500/50"
                          : "bg-stone-950/50 border-stone-800/50 hover:bg-stone-900 hover:border-stone-600 opacity-60 hover:opacity-100"
                    )}
                  >
                     {/* Visual Indicators */}
                     {isOwn && (
                        <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
                     )}

                     {isOccupied ? (
                        hasFamily ? (
                           <Shield className={cn("h-4 w-4 sm:h-5 sm:w-5", isOwn ? "text-green-400" : "text-amber-500")} />
                        ) : (
                           <User className={cn("h-4 w-4 sm:h-5 sm:w-5", isOwn ? "text-green-400" : "text-stone-400")} />
                        )
                     ) : (
                        <div className="text-[10px] text-stone-700 group-hover:text-stone-500 font-mono select-none">
                           {cell.id}
                        </div>
                     )}

                     {/* Coordinate Label on Hover */}
                     <div className="absolute bottom-0 right-0 text-[8px] sm:text-[9px] font-mono leading-none p-0.5 text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {cell.id}
                     </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-stone-900 border-stone-700 text-stone-200 shadow-xl z-50">
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-500">Solar {currentCity}:{currentDistrict}:{cell.id}</p>
                    {isOccupied ? (
                      <>
                        <p className="flex items-center gap-1"><User className="h-3 w-3" /> {cell.data?.nombre_usuario}</p>
                        {cell.data?.nombre_familia && (
                           <p className="flex items-center gap-1 text-stone-400"><Shield className="h-3 w-3" /> {cell.data.etiqueta_familia}</p>
                        )}
                        <p className="text-stone-500">Puntos: {cell.data?.puntos.toLocaleString()}</p>
                        {isOwn && <p className="text-green-400 font-bold mt-1">Tu Propiedad</p>}
                      </>
                    ) : (
                      <p className="text-stone-500 italic">Disponible para colonizar</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>

      <TileDetailsDialog
        tile={selectedTile}
        city={currentCity}
        district={currentDistrict}
        userProperty={userProperty}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  )
}
