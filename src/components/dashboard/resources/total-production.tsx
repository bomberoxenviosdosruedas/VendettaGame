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
import { totalProductionData } from "./resources-data";

export function TotalProduction() {
    return (
        <Card className="border-primary bg-stone-200 text-black overflow-hidden">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">Producción Total</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-primary/70 hover:bg-primary/70">
                            <TableHead className="text-primary-foreground w-1/3">Recurso</TableHead>
                            <TableHead className="text-primary-foreground text-center">Hora</TableHead>
                            <TableHead className="text-primary-foreground text-center">Día</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {totalProductionData.map((item) => (
                            <TableRow key={item.resource} className="bg-stone-200 hover:bg-stone-300/60">
                                <TableCell className="font-semibold">{item.resource}</TableCell>
                                <TableCell className="text-center">{item.hour}</TableCell>
                                <TableCell className="text-center">{item.day.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}