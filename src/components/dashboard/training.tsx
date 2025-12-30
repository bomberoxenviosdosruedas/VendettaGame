import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Training() {
  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4 flex-row items-center justify-between">
        <CardTitle className="text-lg text-primary-foreground">Capacitación</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-center">
        <p className="text-sm">-</p>
      </CardContent>
    </Card>
  );
}
