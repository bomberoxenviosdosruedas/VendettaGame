import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Flag } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { GamePreview } from "./game-preview";

export function LandingPage() {
  const vendettaHeader = PlaceHolderImages.find(p => p.id === "vendetta-header");
  const gangster = PlaceHolderImages.find(p => p.id === "gangster-silhouette");

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
          <Link href="/signup" className="hover:underline">
            Regístrate
          </Link>
          <div className="flex gap-4">
            <span>Online: 2</span>
            <span>Utenti Totali: 100</span>
          </div>
        </nav>

        <div className="bg-gray-800/50 flex justify-between items-center px-4 py-1 text-xs border-b border-border">
          <div className="flex gap-2">
             <Image src="https://flagcdn.com/it.svg" width={20} height={15} alt="Italian Flag" />
             <Image src="https://flagcdn.com/gb.svg" width={20} height={15} alt="British Flag" />
             <Image src="https://flagcdn.com/fr.svg" width={20} height={15} alt="French Flag" />
             <Image src="https://flagcdn.com/de.svg" width={20} height={15} alt="German Flag" />
             <Image src="https://flagcdn.com/es.svg" width={20} height={15} alt="Spanish Flag" />
          </div>
          <div className="text-gray-400">
             <span>En línea: 2</span> | <span>Usuarios Totales: 100</span>
          </div>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-1 gap-4 py-4">
          <section>
            <Card className="bg-primary/20 border-primary">
              <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                <CardTitle className="text-lg text-primary-foreground">Login</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form className="flex items-center gap-2">
                  <Select defaultValue="server1">
                    <SelectTrigger className="w-[150px] bg-input text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="server1">Server 1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Username" className="bg-input" />
                  <Input type="password" placeholder="Password" className="bg-input"/>
                  <Button type="submit" variant="destructive" className="bg-accent hover:bg-accent/90">Enviar</Button>
                </form>
                <Link href="/forgot-password" passHref>
                    <p className="text-xs text-right mt-2 hover:underline cursor-pointer text-gray-400">¿Olvidaste tu password?</p>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section>
             <Card className="bg-primary/20 border-primary">
                <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                   <CardTitle className="text-lg text-primary-foreground">Supporto Tecnico / SOS</CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-card/80">
                   <div className="bg-black/50 p-4 rounded-sm">
                      <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2"><AlertTriangle size={20}/> SYSTEM ALERT</h3>
                      <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                        <li><span className="mr-2">🇬🇧</span> Login issues? Account locked?</li>
                        <li><span className="mr-2">🇮🇹</span> Problemi di accesso? Account bloccato?</li>
                        <li><span className="mr-2">🇪🇸</span> ¿Problemas de conexión?</li>
                        <li><span className="mr-2">🇫🇷</span> Problèmes de connexion?</li>
                        <li><span className="mr-2">🇩🇪</span> Anmeldungsprobleme?</li>
                      </ul>
                      <Button variant="destructive" className="mt-4 w-full bg-accent hover:bg-accent/90">APRI SEGNALAZIONE SOS</Button>
                   </div>
                </CardContent>
             </Card>
          </section>

           <section>
            <Card className="bg-primary/20 border-primary">
              <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                <CardTitle className="text-lg text-primary-foreground">Regístrate</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-center text-sm text-gray-300 space-y-4">
                <p>¿Quieres ser el Capo de la Mafia más importante en la ciudad? ¿Qué esperas?</p>
                <p>Construye habitaciones para obtener más recursos junto con las más avanzadas tecnologías, tropas de ataque e incluso podrás obtener un ejército inmejorable con las tropas de defensa mejor desarrolladas, y así...</p>
                <p className="font-bold text-lg">¡Dominar la ciudad!</p>
                <p>Entrena a tus \"chicos\" para volverse más fuertes; vigila el mapa de la ciudad para comprobar aquellos aliados o enemigos que se encuentren cerca de tu zona; revisa la clasificación para conocer quienes son actualmente los mafiosos más poderosos y... ¡muchas cosas más!</p>
                 <Button variant="destructive" size="lg" className="w-full bg-accent hover:bg-accent/90">
                    REGÍSTRATE GRATIS EN EL SERVIDOR 1
                </Button>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="bg-primary/20 border-primary">
              <CardHeader className="bg-primary py-2 px-4 rounded-t-sm">
                <CardTitle className="text-lg text-primary-foreground">Aviso Importante: Mantenimiento Programado</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm text-gray-300 space-y-2">
                 <p>Estimados Jugadores, para garantizar la estabilidad y la calidad del juego, hemos establecido un nuevo programa de mantenimiento.</p>
                 <p>1. MANTENIMIENTO PROGRAMADO (SEMANAL): Cada Sábado ha sido designado como día oficial para el mantenimiento rutinario. Durante este día, es posible que el servidor esté desconectado temporalmente.</p>
                 <p>2. MANTENIMIENTO URGENTE (NOCTURNO): Cualquier intervención crítica (como la corrección de errores graves) se realizará, cuando sea posible, en horario nocturno. Gracias por su paciencia y apoyo continuo.</p>
                 <p className="text-right">- La Administración</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="bg-stone-200 border-stone-400 text-black p-8 flex flex-col items-center justify-center">
              {gangster && (
                 <Image src={gangster.imageUrl} alt={gangster.description} width={100} height={150} data-ai-hint={gangster.imageHint} />
              )}
              <h2 className="text-6xl font-bold vendetta-font text-black/80">REGISTRATI</h2>
              <h2 className="text-6xl font-bold vendetta-font text-black/80">ORA</h2>
            </Card>
          </section>

          <GamePreview />

        </main>
      </div>
    </div>
  );
}
