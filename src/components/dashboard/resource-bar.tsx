'use client'

import { Coins, Droplets, Shell } from "lucide-react";
import { useGameState } from "@/components/providers/game-state-provider";

export function ResourceBar() {
    const { gameState } = useGameState();

    if (!gameState) {
        return <div className="bg-stone-800 text-white shadow-lg p-2 text-center text-xs">Cargando recursos...</div>;
    }

    const { recursos } = gameState;

    const resources = [
        { name: "Armas", shortName: "A", value: recursos.armas.val, icon: <Shell className="w-5 h-5 text-gray-500" /> },
        { name: "Municion", shortName: "M", value: recursos.municion.val, icon: <Coins className="w-5 h-5 text-yellow-500" /> },
        { name: "Alcohol", shortName: "A", value: recursos.alcohol.val, icon: <Droplets className="w-5 h-5 text-blue-400" /> },
        { name: "Dolares", shortName: "D", value: recursos.dolares.val, icon: <p className="text-lg font-bold text-green-500">$</p> },
    ];

    return (
        <div className="bg-stone-800 text-white shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/20">
                {resources.map(resource => (
                    <div key={resource.name} className="bg-stone-700/80 p-2">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-stone-400">
                                <span className="hidden md:inline">{resource.name}:</span>
                                <span className="md:hidden">{resource.shortName}:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono">{Math.floor(resource.value).toLocaleString()}</span>
                                {resource.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
