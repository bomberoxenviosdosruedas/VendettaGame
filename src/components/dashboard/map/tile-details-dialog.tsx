
'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapTileData } from "@/lib/services/game.service"
import { MapCoordinates, calculateDistance, formatDuration, calculateTravelTime } from "@/lib/utils/map-utils"
import { useRouter } from 'next/navigation'
import { Sword, Eye, Truck, Flag, MapPin, User, Shield } from 'lucide-react'

interface TileDetailsDialogProps {
  tile: MapTileData | null
  city: number
  district: number
  userProperty: {
    city: number
    district: number
    building: number
  } | null
  isOpen: boolean
  onClose: () => void
}

export function TileDetailsDialog({ tile, city, district, userProperty, isOpen, onClose }: TileDetailsDialogProps) {
  const router = useRouter()

  const distance = useMemo(() => {
    if (!tile || !userProperty) return 0;
    const origin: MapCoordinates = {
      city: userProperty.city,
      district: userProperty.district,
      building: userProperty.building
    };
    const target: MapCoordinates = {
      city: city,
      district: district,
      building: tile.coordenada_edificio
    };
    return calculateDistance(origin, target);
  }, [tile, city, district, userProperty]);

  // Estimate travel time with a base speed (e.g. 100) just for display
  const estimatedTime = calculateTravelTime(distance, 100);

  if (!tile) return null;

  const handleAction = (action: string) => {
    // Redirigir a /dashboard/missions
    // Params: type, target=C:B:E
    const targetStr = `${city}:${district}:${tile.coordenada_edificio}`;
    router.push(`/dashboard/missions?type=${action}&target=${targetStr}`);
    onClose();
  };

  const isOwn = tile.es_propia;
  const isEmpty = tile.usuario_id === '00000000-0000-0000-0000-000000000000'; // Assuming empty tiles have null/zero user, but check logic.
  // Actually, get_map_tiles might return null for user fields if empty.
  // Let's check MapTileData type. It has usuario_id string.
  // Usually the backend might filter out empty spots or return them with placeholders.
  // We'll assume if points == 0 or specific check.
  // Wait, legacy code usually treats 0-level or specific ID as empty.
  // Let's assume non-empty if usuario_id is valid.

  // Re-reading MapTileData: usuario_id is string.
  // If it's a free slot, does it appear in get_map_tiles?
  // get_map_tiles returns properties. If a slot is empty, is it returned?
  // Usually map RPCs return ALL slots 1-255 or just occupied ones.
  // If just occupied, then we can't click empty slots unless we render a full grid and fill gaps.
  // CityMap receives `tiles` which is MapTileData[].
  // If we want to click "Empty" slots, CityMap needs to render them.
  // We will address that in CityMap.
  // Here, we assume `tile` is passed. If it's a "virtual" empty tile, we need to handle it.

  // Let's support a "virtual" tile object for empty slots passed from CityMap
  const isOccupied = tile.usuario_id && tile.usuario_id !== '00000000-0000-0000-0000-000000000000';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-stone-900 text-stone-100 border-stone-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-amber-500">
            <MapPin className="h-5 w-5" />
            Solar {city}:{district}:{tile.coordenada_edificio}
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            {isOccupied ? "Propiedad Ocupada" : "Solar Disponible"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isOccupied ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-stone-800 rounded-lg">
                <User className="h-8 w-8 text-stone-400" />
                <div>
                  <p className="font-medium text-stone-200">{tile.nombre_usuario}</p>
                  {tile.nombre_familia && (
                    <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500 mt-1">
                      [{tile.etiqueta_familia}] {tile.nombre_familia}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-stone-800/50 rounded-lg">
                <span className="text-sm text-stone-400">Puntos</span>
                <span className="font-mono text-stone-200">{tile.puntos.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-stone-800/30 rounded-lg border border-stone-700 border-dashed text-center text-stone-500">
              Este solar está disponible para colonizar o fundar una nueva propiedad.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-stone-950 rounded border border-stone-800">
              <span className="block text-xs text-stone-500 mb-1">Distancia</span>
              <span className="font-mono">{distance} km</span>
            </div>
            <div className="p-2 bg-stone-950 rounded border border-stone-800">
              <span className="block text-xs text-stone-500 mb-1">Tiempo Est.</span>
              <span className="font-mono">~{formatDuration(estimatedTime)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2 sm:gap-2">
          {isOwn ? (
            <Button variant="default" className="col-span-2 bg-green-600 hover:bg-green-700" onClick={() => router.push('/dashboard/overview')}>
              Gestionar Propiedad
            </Button>
          ) : isOccupied ? (
            <>
              <Button variant="outline" className="border-stone-600 hover:bg-stone-800" onClick={() => handleAction('espiar')}>
                <Eye className="mr-2 h-4 w-4" /> Espiar
              </Button>
              <Button variant="outline" className="border-stone-600 hover:bg-stone-800" onClick={() => handleAction('transportar')}>
                <Truck className="mr-2 h-4 w-4" /> Transportar
              </Button>
              <Button variant="destructive" className="col-span-2 bg-red-900/80 hover:bg-red-900 border-red-800" onClick={() => handleAction('atacar')}>
                <Sword className="mr-2 h-4 w-4" /> Atacar
              </Button>
            </>
          ) : (
            <Button className="col-span-2 bg-amber-600 hover:bg-amber-700" onClick={() => handleAction('colonizar')}>
              <Flag className="mr-2 h-4 w-4" /> Colonizar / Fundar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
