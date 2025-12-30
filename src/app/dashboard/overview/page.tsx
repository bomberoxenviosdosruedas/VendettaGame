import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { overviewData } from "@/lib/data/overview-data";
import { cn } from "@/lib/utils";
  
export default function OverviewPage() {
    const { playerName, mainBuilding, resources, levels, points } = overviewData;

    return (
        <Card className="border-primary bg-stone-200 text-black overflow-hidden">
            <CardHeader className="bg-primary/80 py-3 px-4">
                <CardTitle className="text-xl text-primary-foreground">
                    Visión Global {playerName}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableBody>
                            <TableRow className="bg-primary/70 hover:bg-primary/70">
                                <TableHead className="text-primary-foreground font-bold">{mainBuilding.name}</TableHead>
                                <TableHead className="text-primary-foreground font-bold text-center">{mainBuilding.value}</TableHead>
                                <TableHead className="text-primary-foreground font-bold text-center">=</TableHead>
                            </TableRow>
                            {resources.map((resource, index) => (
                                <TableRow key={index} className="bg-stone-200 hover:bg-stone-300/60">
                                    <TableCell className="font-semibold">{resource.name}</TableCell>
                                    <TableCell className={cn("text-center font-semibold", resource.highlight && "text-red-600")}>
                                        {resource.value} (max. {resource.max})
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {resource.value} (max. {resource.max})
                                    </TableCell>
                                </TableRow>
                            ))}
                            {levels.map((item, index) => (
                                <TableRow key={index} className="bg-stone-200 hover:bg-stone-300/60">
                                    <TableCell className="font-semibold">{item.name}</TableCell>
                                    <TableCell className="text-center font-bold">{item.level}</TableCell>
                                    <TableCell className="text-center">{item.level}</TableCell>
                                </TableRow>
                            ))}
                             <TableRow className="bg-stone-200 hover:bg-stone-300/60">
                                <TableCell className="font-semibold">Puntos</TableCell>
                                <TableCell className="text-center font-bold">{points}</TableCell>
                                <TableCell className="text-center">{points}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
