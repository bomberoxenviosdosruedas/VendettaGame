import { recruitmentData, recruitmentQueue } from "@/lib/data/recruitment-data";
import { TroopCard } from "@/components/dashboard/recruitment/troop-card";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RecruitmentPage() {
  return (
    <div className="space-y-4">
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">
                    Reclutamiento
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center gap-2">
                <Select>
                    <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Cola de reclutamiento" />
                    </SelectTrigger>
                    <SelectContent>
                        {recruitmentQueue.map((item, index) => (
                            <SelectItem key={index} value={`${item.name}-${index}`}>
                                {item.quantity} {item.name} - Durata {item.duration}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm">Cancella truppe selezionate</Button>
                <p className="text-xs">Durata dell'elenco d' attesa: {recruitmentQueue[0]?.duration || '00:00:00'}</p>
            </CardContent>
        </Card>
        <div className="space-y-2">
            {recruitmentData.map((troop) => (
                <TroopCard key={troop.id} troop={troop} />
            ))}
        </div>
    </div>
  );
}
