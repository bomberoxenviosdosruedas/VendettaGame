import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { GamePreview } from "./game-preview";
import { getPublicStats } from "@/lib/actions/public-stats";
import { LoginForm } from "./login-form";
import { TopPlayers } from "./top-players";

export async function LandingPage() {
  const vendettaHeader = PlaceHolderImages.find(p => p.id === "vendetta-header");
  const gangster = PlaceHolderImages.find(p => p.id === "gangster-silhouette");

  // Fetch stats server-side
  const stats = await getPublicStats();

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 py-2">
        <header className="relative text-center py-4 border-b-4 border-primary">
          {vendettaHeader && (
            <Image
              src={vendettaHeader.imageUrl}
              alt={vendettaHeader.description}
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-20"
              data-ai-hint={vendettaHeader.imageHint}
              priority
            />
          )}
          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl vendetta-font text-gray-200">VENDETTA</h1>
            <p className="text-xl md:text-2xl vendetta-font text-gray-300">THE VAULT GATE</p>
          </div>
        </header>

        <nav className="bg-primary text-primary-foreground flex justify-between items-center px-4 py-2 text-sm">
          <Link href="/signup" className="hover:underline font-bold">
            ¡REGÍSTRATE GRATIS!
          </Link>
          <div className="flex gap-4">
            <span>Online: {stats.online}</span>
            <span>Jugadores: {stats.registered}</span>
          </div>
        </nav>

        <div className="bg-gray-800/50 flex justify-between items-center px-4 py-1 text-xs border-b border-border">
          <div className="flex gap-2">
            <button aria-label="Select language: Italian" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm hover:opacity-80 transition-opacity">
              <Image src="https://flagcdn.com/it.svg" width={20} height={15} alt="Italian Flag" />
            </button>
            <button aria-label="Select language: English" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm hover:opacity-80 transition-opacity">
              <Image src="https://flagcdn.com/gb.svg" width={20} height={15} alt="British Flag" />
            </button>
            <button aria-label="Select language: French" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm hover:opacity-80 transition-opacity">
              <Image src="https://flagcdn.com/fr.svg" width={20} height={15} alt="French Flag" />
            </button>
            <button aria-label="Select language: German" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm hover:opacity-80 transition-opacity">
              <Image src="https://flagcdn.com/de.svg" width={20} height={15} alt="German Flag" />
            </button>
            <button aria-label="Select language: Spanish" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm hover:opacity-80 transition-opacity">
              <Image src="https://flagcdn.com/es.svg" width={20} height={15} alt="Spanish Flag" />
            </button>
          </div>
          <div className="text-gray-400">
             Server Time: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">

          {/* Left Column */}
          <div className="space-y-4 lg:col-span-2">

            {/* Login Section */}
            <section>
                <Card className="bg-primary/20 border-primary">
                <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                    <CardTitle className="text-lg text-primary-foreground">Login</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <LoginForm />
                </CardContent>
                </Card>
            </section>

             {/* Game Preview Carousel */}
             <GamePreview />

             {/* Description / Register Call to Action */}
             <section>
                <Card className="bg-primary/20 border-primary">
                <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                    <CardTitle className="text-lg text-primary-foreground">Regístrate</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center text-sm text-gray-300 space-y-4">
                    <p>¿Quieres ser el Capo de la Mafia más importante en la ciudad? ¿Qué esperas?</p>
                    <p>Construye habitaciones para obtener más recursos junto con las más avanzadas tecnologías, tropas de ataque e incluso podrás obtener un ejército inmejorable con las tropas de defensa mejor desarrolladas, y así...</p>
                    <p className="font-bold text-lg text-red-500">¡Dominar la ciudad!</p>
                    <p>Entrena a tus &quot;chicos&quot; para volverse más fuertes; vigila el mapa de la ciudad para comprobar aquellos aliados o enemigos que se encuentren cerca de tu zona; revisa la clasificación para conocer quienes son actualmente los mafiosos más poderosos y... ¡muchas cosas más!</p>
                    <Link href="/signup">
                        <Button variant="destructive" size="lg" className="w-full bg-accent hover:bg-accent/90 mt-2">
                            REGÍSTRATE GRATIS EN EL SERVIDOR 1
                        </Button>
                    </Link>
                </CardContent>
                </Card>
            </section>

          </div>

          {/* Right Column */}
          <div className="space-y-4">

            {/* Top Players */}
            <section>
                <TopPlayers />
            </section>

            {/* Support */}
            <section>
                <Card className="bg-primary/20 border-primary">
                    <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                    <CardTitle className="text-lg text-primary-foreground">Supporto Tecnico / SOS</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-card/80">
                    <div className="bg-black/50 p-4 rounded-sm">
                        <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2"><AlertTriangle size={20}/> SYSTEM ALERT</h3>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside text-gray-300">
                            <li><span className="mr-2">🇬🇧</span> Login issues? Account locked?</li>
                            <li><span className="mr-2">🇮🇹</span> Problemi di accesso? Account bloccato?</li>
                            <li><span className="mr-2">🇪🇸</span> ¿Problemas de conexión?</li>
                        </ul>
                        <Button variant="destructive" className="mt-4 w-full bg-accent hover:bg-accent/90 text-xs">APRI SEGNALAZIONE SOS</Button>
                    </div>
                    </CardContent>
                </Card>
            </section>

             {/* Maintenance Notice */}
             <section>
                <Card className="bg-primary/20 border-primary">
                <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                    <CardTitle className="text-lg text-primary-foreground">Aviso Importante</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs text-gray-300 space-y-2">
                    <p className="font-bold">MANTENIMIENTO PROGRAMADO:</p>
                    <p>Cada Sábado ha sido designado como día oficial para el mantenimiento rutinario.</p>
                </CardContent>
                </Card>
            </section>

            {/* Banner */}
            <section>
                <Card className="bg-stone-200 border-stone-400 text-black p-4 flex flex-col items-center justify-center text-center">
                {gangster && (
                    <Image src={gangster.imageUrl} alt={gangster.description} width={80} height={100} data-ai-hint={gangster.imageHint} className="mb-2" />
                )}
                <h2 className="text-4xl font-bold vendetta-font text-black/80">REGISTRATI</h2>
                <h2 className="text-4xl font-bold vendetta-font text-black/80">ORA</h2>
                </Card>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
