'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BaseBuildingRPC } from '@/types/legacy_schema';

interface BuildingDetailsHeaderProps {
    building: BaseBuildingRPC;
}

export default function BuildingDetailsHeader({ building }: BuildingDetailsHeaderProps) {
    return (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col md:flex-row gap-6 border border-slate-700">
            <div className="w-full md:w-64 h-48 bg-slate-700 rounded-lg flex-shrink-0 relative overflow-hidden">
                {/* Fallback Image */}
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-slate-500">
                    {building.name[0]}
                </div>
            </div>

            <div className="flex-grow space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{building.name}</h1>
                    <p className="text-xl text-slate-400">Nivel Actual: <span className="text-white">{building.level}</span></p>
                </div>

                <p className="text-slate-300 leading-relaxed">
                    {building.description}
                </p>

                <div className="flex gap-6 pt-4 border-t border-slate-700">
                     <div className="text-center">
                        <span className="block text-xs text-slate-500 uppercase">Puntos por Nivel</span>
                        <span className="text-lg font-mono text-yellow-500">{building.points}</span>
                     </div>
                     <div className="text-center">
                        <span className="block text-xs text-slate-500 uppercase">Duración Base</span>
                        <span className="text-lg font-mono text-blue-400">{building.base_duration}s</span>
                     </div>
                </div>

                <div className="pt-4">
                    <Link href="/dashboard/buildings">
                        <button className="text-sm text-slate-400 hover:text-white underline">
                            ← Volver al listado
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
