
'use client';
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { TechItem } from "./tech-tree-data";
import { cn } from "@/lib/utils";

type TechTreeTableProps = {
    data: TechItem[];
};

export function TechTreeTable({ data }: TechTreeTableProps) {
    return (
        <div className="mt-4 border border-primary/50 rounded-md">
            <div className="grid grid-cols-2 bg-primary/80 text-primary-foreground font-bold rounded-t-md">
                <div className="p-2">Habitación</div>
                <div className="p-2">Requisitos (Nivel)</div>
            </div>
            <div className="divide-y divide-primary/30">
                {data.map((item) => {
                    const image = PlaceHolderImages.find((p) => p.id === item.image);
                    return (
                        <div key={item.id} className="grid grid-cols-2 items-center">
                            <div className="p-2 flex flex-col items-center justify-center text-center">
                                {image && (
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.description}
                                        width={80}
                                        height={60}
                                        className={cn(
                                            "rounded border-2 border-dashed object-cover w-20 h-16",
                                            item.available ? "border-green-500" : "border-red-500"
                                        )}
                                        data-ai-hint={image.imageHint}
                                    />
                                )}
                                <span className="text-sm mt-1 font-medium">{item.name}</span>
                            </div>
                            <div className="p-2 text-sm">
                                {item.requirements.length > 0 ? (
                                    <ul className="list-none">
                                        {item.requirements.map((req, index) => (
                                            <li key={index}>
                                                {req.name} <span className="text-red-500 font-bold">({req.level})</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>-</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
