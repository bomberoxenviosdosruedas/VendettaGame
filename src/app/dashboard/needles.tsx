import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const stats = [
    { label: "Cantidad de edificios", value: "1" },
    { label: "Puntos de construcción", value: "7" },
    { label: "Puntos de entrenamiento", value: "0" },
    { label: "Puntos de tropa", value: "0" },
]

export function Needles() {
  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4">
        <CardTitle className="text-lg text-primary-foreground">Agujas</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm">
        {stats.map(stat => (
            <div key={stat.label} className="flex justify-between">
                <span>{stat.label}</span>
                <span>{stat.value}</span>
            </div>
        ))}
        <div className="flex justify-between border-t border-black/20 mt-2 pt-2">
            <span>Poder de ataque</span>
            <span>100% (<Link href="#" className="text-blue-800 hover:underline">Detalles</Link>)</span>
        </div>
        <div className="text-center mt-2">
            <Link href="#" className="text-blue-800 hover:underline">Visión global</Link>
        </div>
      </CardContent>
    </Card>
  );
}
