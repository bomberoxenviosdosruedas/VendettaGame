'use client'

import { Coins, Droplets, Shell } from "lucide-react";

const resources = [
    { name: "Armas", shortName: "A", value: "10.000", icon: <Shell className="w-5 h-5 text-gray-500" /> },
    { name: "Municion", shortName: "M", value: "10.000", icon: <Coins className="w-5 h-5 text-yellow-500" /> },
    { name: "Alcohol", shortName: "A", value: "10.000", icon: <Droplets className="w-5 h-5 text-blue-400" /> },
    { name: "Dolares", shortName: "D", value: "10.000", icon: <p className="text-lg font-bold text-green-500">$</p> },
]

export function ResourceBar() {
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
                                <span className="text-sm font-mono">{resource.value}</span>
                                {resource.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
