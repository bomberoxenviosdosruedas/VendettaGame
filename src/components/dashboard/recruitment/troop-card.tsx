'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Coins, Shell, Droplets } from "lucide-react";
import { ReactNode, useState, useTransition } from "react";
import type { Troop as TroopData } from "@/lib/data/recruitment-data";
import { recruitTroopsAction } from "@/actions/game.actions";
import { useToast } from "@/hooks/use-toast";

type TroopCardProps = {
  troop: TroopData;
  propiedadId?: string;
  currentAmount: number;
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

export function TroopCard({ troop, propiedadId, currentAmount }: TroopCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === troop.image) || PlaceHolderImages.find(p => p.id === 'dark-alley');
  const [amount, setAmount] = useState<number | ''>('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRecruit = async () => {
    if (!propiedadId || !amount || amount <= 0) return;

    startTransition(async () => {
        const result = await recruitTroopsAction(troop.id, Number(amount));
        if (result.success) {
            toast({ title: "Reclutamiento iniciado", description: `Reclutando ${amount} ${troop.name}.` });
            setAmount('');
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    });
  };

  return (
    <div className="bg-stone-200 text-black p-4 rounded-md border border-primary/50 flex flex-col items-start gap-4">
        <div className="flex justify-between w-full">
            <h3 className="font-bold text-lg text-primary">{troop.name}</h3>
            <span className="text-sm font-bold bg-white/50 px-2 py-1 rounded">Disponibles: {currentAmount}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full">
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
                <p className="text-xs text-center mt-1">{troop.duration}</p>
            </div>
            <div className="flex-1">
                <p className="text-sm mb-2">{troop.description}</p>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm border-t border-b border-black/10 py-2">
                {Object.entries(troop.costs).map(([resource, value]) => (
                    <div key={resource} className="flex items-center">
                    <span>{resource.charAt(0)}: {value}</span>
                    <ResourceIcon type={resource} />
                    </div>
                ))}
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Input
                    type="number"
                    placeholder="0"
                    className="w-20 h-8 text-sm text-center"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={1}
                />
                <div className="flex gap-1">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="bg-accent hover:bg-accent/90 h-8 text-xs"
                        onClick={handleRecruit}
                        disabled={isPending || !propiedadId || !amount}
                    >
                        {isPending ? "..." : "Ir!"}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">Max</Button>
                </div>
            </div>
        </div>
    </div>
  );
}
