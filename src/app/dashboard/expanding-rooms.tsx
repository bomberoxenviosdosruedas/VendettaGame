import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExpandingRooms() {
  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4">
        <CardTitle className="text-lg text-primary-foreground">
          Habitaciones en expansión
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm flex justify-between">
        <span className="font-mono">00:19:29</span>
        <span>Oficina del Jefe (2) Edificio 34:13:129</span>
      </CardContent>
    </Card>
  );
}
