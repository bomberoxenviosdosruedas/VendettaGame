'use client'
import Image from "next/image";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PlaceHolderImages } from "@/lib/placeholder-images";


const previewImages = [
    PlaceHolderImages.find(p => p.id === "game-preview-1"),
    PlaceHolderImages.find(p => p.id === "game-preview-2"),
    PlaceHolderImages.find(p => p.id === "game-preview-3"),
    PlaceHolderImages.find(p => p.id === "game-preview-4"),
    PlaceHolderImages.find(p => p.id === "game-preview-5"),
].filter(Boolean) as (typeof PlaceHolderImages[0])[];


export function GamePreview() {
    return (
        <section>
            <Card className="bg-primary/20 border-primary">
                <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                    <CardTitle className="text-lg text-primary-foreground">Vista previa del juego</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-300 mb-4">Haz clic en las imágenes para ampliarlas y echar un vistazo al juego.</p>
                    <div className="flex justify-center gap-2">
                        {previewImages.map((img, index) => (
                             <Dialog key={index}>
                                <DialogTrigger>
                                     <Image
                                        key={index}
                                        src={img.imageUrl}
                                        alt={`${img.description} ${index + 1}`}
                                        width={120}
                                        height={90}
                                        className="border-2 border-gray-500 hover:border-accent cursor-pointer transition-all"
                                        data-ai-hint={img.imageHint}
                                    />
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl bg-card border-primary">
                                     <Image
                                        src={img.imageUrl}
                                        alt={`${img.description} ${index + 1}`}
                                        width={800}
                                        height={600}
                                        className="w-full h-auto"
                                        data-ai-hint={img.imageHint}
                                    />
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
