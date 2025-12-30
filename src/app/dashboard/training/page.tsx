
import { trainingData } from "@/lib/data/training-data";
import { TrainingCard } from "@/components/dashboard/training/training-card";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";

export default function TrainingPage() {
  return (
    <div className="space-y-4">
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">
                    Allenamento
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {trainingData.map((training) => (
                    <TrainingCard key={training.id} training={training} />
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
