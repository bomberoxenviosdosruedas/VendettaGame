'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Coins, Shell, Droplets } from "lucide-react";
import { useState, useTransition } from "react";
import { ConfiguracionTropa, Recursos } from "@/types/game";
import { recruitTroopsAction } from "@/lib/actions/recruitment.actions";
import { useToast } from "@/hooks/use-toast";

type TroopCardProps = {
  troop: ConfiguracionTropa;
  currentAmount: number;
  resources: Recursos;
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

export function TroopCard({ troop, currentAmount, resources }: TroopCardProps) {
  // Use a fallback image if 'troop.url_imagen' is not in PlaceHolderImages logic or use direct URL
  // Assuming PlaceHolderImages has logic for IDs. If `url_imagen` is a filename like 'troop-porteador', we use it.
  // The DB `url_imagen` might be 'troop-porteador'.
  const image = PlaceHolderImages.find((p) => p.id === troop.url_imagen) || PlaceHolderImages.find(p => p.id === 'dark-alley');
  
  const [amount, setAmount] = useState<number | ''>('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const calculateMax = () => {
    let max = Infinity;
    if (troop.costo_armas > 0) max = Math.min(max, Math.floor(resources.armas / troop.costo_armas));
    if (troop.costo_municion > 0) max = Math.min(max, Math.floor(resources.municion / troop.costo_municion));
    if (troop.costo_dolares > 0) max = Math.min(max, Math.floor(resources.dolares / troop.costo_dolares));
    // Alcohol is not usually a cost for troops unless specified, but schema doesn't have it.
    // Wait, schema has `costo_armas`, `costo_municion`, `costo_dolares`. No alcohol cost in schema.
    
    return max === Infinity ? 0 : max;
  };

  const maxRecruitable = calculateMax();

  const handleRecruit = async () => {
    const quantity = Number(amount);
    if (!quantity || quantity <= 0) return;

    if (quantity > maxRecruitable) {
        toast({ title: "Error", description: "No tienes suficientes recursos.", variant: "destructive" });
        return;
    }

    startTransition(async () => {
        const result = await recruitTroopsAction(troop.id, quantity);
        if (result.success) {
            toast({ title: "Reclutamiento iniciado", description: `Reclutando ${quantity} ${troop.nombre}.` });
            setAmount('');
        } else {
            toast({ title: "Error", description: result.error || "Error desconocido", variant: "destructive" });
        }
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-stone-200 text-black p-4 rounded-md border border-primary/50 flex flex-col items-start gap-4">
        <div className="flex justify-between w-full">
            <h3 className="font-bold text-lg text-primary">{troop.nombre}</h3>
            <span className="text-sm font-bold bg-white/50 px-2 py-1 rounded">Disponibles: {currentAmount}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-shrink-0 w-24">
                {image && (
                    <Image
                        src={image.imageUrl}
                        alt={troop.nombre}
                        width={100}
                        height={100}
                        className="rounded w-full h-auto object-cover"
                    />
                )}
                <p className="text-xs text-center mt-1">{formatDuration(troop.duracion_reclutamiento)}</p>
            </div>
            <div className="flex-1">
                <p className="text-sm mb-2">{troop.descripcion}</p>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm border-t border-b border-black/10 py-2">
                    {troop.costo_armas > 0 && (
                        <div className="flex items-center">
                            <span>Armas: {troop.costo_armas}</span>
                            <ResourceIcon type="Armas" />
                        </div>
                    )}
                    {troop.costo_municion > 0 && (
                        <div className="flex items-center">
                            <span>Munición: {troop.costo_municion}</span>
                            <ResourceIcon type="Municion" />
                        </div>
                    )}
                     {troop.costo_dolares > 0 && (
                        <div className="flex items-center">
                            <span>Dólares: {troop.costo_dolares}</span>
                            <ResourceIcon type="Dolares" />
                        </div>
                    )}
                </div>
                 <div className="mt-2 text-xs flex gap-2 text-muted-foreground">
                    <span>ATK: {troop.ataque}</span>
                    <span>DEF: {troop.defensa}</span>
                    <span>VEL: {troop.velocidad}</span>
                    <span>CAP: {troop.capacidad_carga}</span>
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
                    max={maxRecruitable}
                />
                <div className="flex gap-1">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="bg-accent hover:bg-accent/90 h-8 text-xs"
                        onClick={handleRecruit}
                        disabled={isPending || !amount || Number(amount) <= 0 || Number(amount) > maxRecruitable}
                    >
                        {isPending ? "..." : "Reclutar"}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => setAmount(maxRecruitable)}
                        disabled={maxRecruitable === 0}
                    >
                        Max ({maxRecruitable})
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
