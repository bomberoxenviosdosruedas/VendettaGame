'use client'
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Changelog() {
    const changelogImage = PlaceHolderImages.find(p => p.id === "changelog");

    return (
        <section>
            <Card className="border-primary bg-card text-card-foreground overflow-hidden">
                <CardHeader className="bg-primary/80 py-2 px-4">
                    <CardTitle className="text-lg text-primary-foreground">Changelog Ufficiale</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {changelogImage && (
                        <div className="relative h-64 md:h-96">
                            <Image
                                src={changelogImage.imageUrl}
                                alt={changelogImage.description}
                                fill
                                style={{ objectFit: 'cover' }}
                                data-ai-hint={changelogImage.imageHint}
                                priority
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4">
                                <div className="text-center text-white">
                                    <h2 className="text-5xl md:text-7xl vendetta-font text-shadow">CHANGELOG</h2>
                                    <p className="text-lg md:text-xl vendetta-font">DOKUWIKI - SERVER DI VENDETTA</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
