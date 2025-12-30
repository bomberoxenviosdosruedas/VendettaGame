import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const vendettaImage = PlaceHolderImages.find(p => p.id === "vendetta-logo");
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Left Column (Image/Branding) - Hidden on Mobile, Visible on LG */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary/5 p-12 relative overflow-hidden">
        <div className="text-center z-10 relative">
          {vendettaImage && (
            <div className="relative mx-auto mb-8 w-48 h-48 lg:w-64 lg:h-64">
                <Image
                src={vendettaImage.imageUrl}
                alt={vendettaImage.description}
                fill
                className="rounded-full shadow-2xl object-cover"
                data-ai-hint={vendettaImage.imageHint}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                />
            </div>
          )}
          <h1 className="text-5xl xl:text-6xl font-bold text-primary font-headline tracking-tight">Vendetta</h1>
          <p className="mt-4 text-xl xl:text-2xl text-foreground/80 max-w-md mx-auto">
            El juego de estrategia y conquista definitivo.
          </p>
        </div>
        {/* Abstract Background Elements could go here */}
      </div>

      {/* Right Column (Form) - Full width on Mobile */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm sm:max-w-md space-y-6">
            {/* Mobile Branding (Visible only on small screens) */}
            <div className="lg:hidden text-center mb-8">
                 <h1 className="text-4xl font-bold text-primary font-headline">Vendetta</h1>
                 <p className="text-muted-foreground mt-2">Bienvenido de nuevo</p>
            </div>
            
            {children}
        </div>
      </div>
    </div>
  )
}
