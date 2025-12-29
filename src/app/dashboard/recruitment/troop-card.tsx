'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Coins, Shell, Droplets, Swords, Shield, Rabbit, Warehouse } from "lucide-react";
import type { Troop } from "./recruitment-data";

type TroopCardProps = {
  troop: Troop;
};

const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Armas': return <Shell className="w-4 h-4 inline-block ml-1" />;
        case 'Municion': return <Coins className="w-4 h-4 inline-block ml-1" />;
        case 'Alcohol': return <Droplets className="w-4 h-4 inline-block ml-1" />;
        case 'Dolares': return <p className="text-lg font-bold text-green-600 inline-block ml-1">$</p>;
        default: return null;
    }
}

const StatIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'attack': return <Swords className="w-4 h-4 inline-block mr-1 text-red-600" />;
        case 'defense': return <Shield className="w-4 h-4 inline-block mr-1 text-blue-600" />;
        case 'speed': return <Rabbit className="w-4 h-4 inline-block mr-1 text-yellow-600" />;
        case 'capacity': return <Warehouse className="w-4 h-4 inline-block mr-1 text-gray-600" />;
        default: return null;
    }
}

export function TroopCard({ troop }: TroopCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === troop.image) || PlaceHolderImages.find(p => p.id === 'dark-alley');

  return (
    <div className="bg-stone-200 text-black p-4 rounded-md border border-primary/50 flex flex-col md:flex-row gap-4 items-start md:items-center min-h-[200px]">
      <div className="flex-shrink-0 w-24 md:w-24">
        {image && (
            <Image
                src={image.imageUrl}
                alt={image.description}
                width={100}
                height={100}
                className="rounded w-full h-auto object-cover"
                data-ai-hint={image.imageHint}
            />
        )}
      </div>
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg text-primary">{troop.name}</h3>
        <p className="text-sm my-2">{troop.description}</p>
        
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-gray-700 my-2">
            {Object.entries(troop.stats).map(([stat, value]) => (
                <div key={stat} className="flex items-center" title={`${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}`}>
                    <StatIcon type={stat} />
                    <span>{value}</span>
                </div>
            ))}
        </div>
        
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm border-t border-b border-black/10 py-2 my-2">
          {Object.entries(troop.costs).map(([resource, value]) => (
            <div key={resource} className="flex items-center">
              <span>{value.toLocaleString()}</span>
              <ResourceIcon type={resource} />
            </div>
))}
           <span className="text-xs">Duración: {troop.duration}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
            <Input type="number" placeholder="Cantidad" className="w-24 h-8 text-sm" />
            <Button variant="destructive" size="sm" className="bg-accent hover:bg-accent/90 h-8">
                Reclutar
            </Button>
        </div>

      </div>
    </div>
  );
}
