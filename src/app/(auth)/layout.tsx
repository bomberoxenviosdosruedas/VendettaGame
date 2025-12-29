import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const vendettaImage = PlaceHolderImages.find(p => p.id === "vendetta-logo");
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary/5 p-12">
        <div className="text-center">
          {vendettaImage && (
            <Image
              src={vendettaImage.imageUrl}
              alt={vendettaImage.description}
              width={200}
              height={200}
              className="mx-auto rounded-full mb-8 shadow-2xl"
              data-ai-hint={vendettaImage.imageHint}
              priority
            />
          )}
          <h1 className="text-5xl font-bold text-primary font-headline">Vendetta</h1>
          <p className="mt-4 text-xl text-foreground/80">El juego de estrategia y conquista definitivo.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
