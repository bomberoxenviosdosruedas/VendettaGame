import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TroopsInTraining() {
  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4 flex-row items-center justify-between">
        <CardTitle className="text-lg text-primary-foreground">Tropas en entrenamiento</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground">
          <span className="font-bold">[-]</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 text-center">
        <p className="text-sm">-</p>
      </CardContent>
    </Card>
  );
}
