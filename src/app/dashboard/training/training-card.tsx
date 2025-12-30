
'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Coins, Shell, Droplets } from "lucide-react";
import type { Training } from "./training-data";

type TrainingCardProps = {
  training: Training;
};

const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'Armas': return <Shell className="w-4 h-4 inline-block ml-1" />;
        case 'Municion': return <Coins className="w-4 h-4 inline-block ml-1" />;
        case 'Dolares': return <p className="text-lg font-bold text-green-600 inline-block ml-1">$</p>;
        default: return null;
    }
}

export function TrainingCard({ training }: TrainingCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === training.image);

  return (
    <div className="bg-stone-300/60 text-black p-4 rounded-md border border-primary/50 flex flex-col md:flex-row gap-4 items-start w-full">
      <div className="flex-shrink-0 w-24">
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
      <div className="flex-1">
        <h3 className="font-bold text-lg text-primary">{training.name}</h3>
        <p className="text-sm my-2">{training.description}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
          {Object.entries(training.costs).map(([resource, value]) => (
            <div key={resource} className="flex items-center">
              <span>{resource.charAt(0)}: {value.toLocaleString()}</span>
              <ResourceIcon type={resource} />
            </div>
          ))}
           <span>Duración: {training.duration}</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-full ml-auto text-center">
        <Button variant="link" className="text-green-600 h-auto p-0 flex flex-col items-center">
            <span className="text-lg">Inizia</span>
            <span>espansione</span>
        </Button>
      </div>
    </div>
  );
}
