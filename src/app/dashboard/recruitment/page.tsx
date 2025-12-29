import { recruitmentData } from "./recruitment-data";
import { TroopCard } from "./troop-card";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";

export default function RecruitmentPage() {
  return (
    <div className="space-y-4">
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">
                    Reclutamiento
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <p className="text-sm">En el Campo de Entrenamiento, puedes reclutar diferentes tipos de unidades. Cada unidad tiene diferentes fortalezas y debilidades. La velocidad de reclutamiento depende del nivel de tu Campo de Entrenamiento.</p>
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recruitmentData.map((troop) => (
            <TroopCard key={troop.id} troop={troop} />
            ))}
        </div>
    </div>
  );
}
