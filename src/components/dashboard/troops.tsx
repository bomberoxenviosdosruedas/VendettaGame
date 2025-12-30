import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function Troops() {
  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4">
        <CardTitle className="text-lg text-primary-foreground">Tropas</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2 text-center">
        <Link href="#" className="block hover:underline text-sm text-blue-800">
          Visión global de las tropas
        </Link>
        <Link href="#" className="block hover:underline text-sm text-blue-800">
          Visión global de las Misiones
        </Link>
        <p className="text-sm">Sin unidad</p>
      </CardContent>
    </Card>
  );
}
