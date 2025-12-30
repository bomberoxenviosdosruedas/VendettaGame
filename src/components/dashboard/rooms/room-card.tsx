'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Coins, Shell, Droplets } from "lucide-react";
import type { Room } from "@/lib/data/rooms-data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RoomCardProps = {
  room: Room;
};

const ResourceIcon = ({ type }: { type: string }) => {
    const iconClass = "w-3 h-3 md:w-4 md:h-4 mr-1";
    switch (type) {
        case 'Armas':
            return <Shell className={`${iconClass} text-stone-600`} />;
        case 'Municion':
            return <Coins className={`${iconClass} text-yellow-600`} />;
        case 'Dolares':
            return <span className={`${iconClass} font-bold text-green-700 flex items-center justify-center`}>$</span>;
        default:
            return null;
    }
}

export function RoomCard({ room }: RoomCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === room.image) || PlaceHolderImages.find(p => p.id === 'dark-alley');

  return (
    <Card className="flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-shadow duration-300 border-primary/20 bg-card">
      {/* Image Section */}
      <div className="relative w-full sm:w-1/3 min-h-[160px] sm:min-h-full">
        {image && (
            <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            className="object-cover"
            data-ai-hint={image.imageHint}
            sizes="(max-width: 640px) 100vw, 33vw"
            />
        )}
        <div className="absolute top-2 right-2 sm:hidden">
             {room.level && <Badge variant="secondary" className="font-bold">Nv. {room.level}</Badge>}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between p-4 gap-3">
        <div className="space-y-2">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg md:text-xl text-primary font-headline leading-tight">
                {room.name}
                </h3>
                <Badge variant="outline" className="hidden sm:inline-flex border-primary/50 text-primary font-bold">
                    Nv. {room.level || 1}
                </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                {room.description}
            </p>
        </div>

        {/* Resources & Action Footer */}
        <div className="space-y-3 pt-2 border-t border-border/50">
             <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground">
                {Object.entries(room.costs).map(([resource, value]) => (
                    <div key={resource} className="flex items-center font-medium">
                        <ResourceIcon type={resource} />
                        <span>{value}</span>
                    </div>
                ))}
                <div className="flex items-center ml-auto text-xs font-mono bg-secondary/30 px-2 py-0.5 rounded">
                    ⏱ {room.duration}
                </div>
            </div>

            <div className="flex justify-end pt-1">
                {room.status === 'upgrade' && room.upgradeLevel ? (
                <div className="w-full bg-secondary/20 p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">Mejorando a</p>
                    <p className="font-bold text-green-600">Nivel {room.upgradeLevel}</p>
                </div>
                ) : (
                <Button className="w-full sm:w-auto" size="sm">
                    Ampliar
                </Button>
                )}
            </div>
        </div>
      </div>
    </Card>
  );
}
