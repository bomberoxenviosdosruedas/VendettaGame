import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExpandingRooms() {
  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4 flex-row items-center justify-between">
        <CardTitle className="text-lg text-primary-foreground">
          Habitaciones en expansión
        </CardTitle>
        <span className="text-sm text-primary-foreground font-mono">(1/1)</span>
      </CardHeader>
      <CardContent className="p-4 text-sm flex justify-between items-center">
        <span className="font-mono">00:19:29</span>
        <span className="truncate px-2">Oficina del Jefe (2)</span>
        <span className="font-mono">34:13:129</span>
      </CardContent>
    </Card>
  );
}
