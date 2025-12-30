import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export function BuildingInfo() {
  const buildingImage = PlaceHolderImages.find(p => p.id === "dark-alley") || PlaceHolderImages.find(p => p.id === "vendetta-header");

  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4">
        <CardTitle className="text-lg text-primary-foreground">
          all2 - Edificio 34:13:129
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center gap-2">
        {buildingImage && (
             <Image
                src={buildingImage.imageUrl}
                alt={buildingImage.description}
                width={400}
                height={200}
                className="w-full h-auto rounded"
                data-ai-hint={buildingImage.imageHint}
            />
        )}
        <Link href="#" className="text-sm hover:underline text-blue-800">
            Editar imagen
        </Link>
      </CardContent>
    </Card>
  );
}
