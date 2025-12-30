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
import { attackPowerData } from "@/lib/data/poderataque-data";

export default function AttackPowerPage() {
    return (
        <Card className="border-primary bg-stone-200 text-black overflow-hidden">
            <CardHeader className="bg-primary/80 py-3 px-4">
                <CardTitle className="text-xl text-primary-foreground">
                    Poder de ataque ( % )
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-primary/70 hover:bg-primary/70">
                                <TableHead className="text-primary-foreground font-bold align-bottom" rowSpan={2}>Edificios</TableHead>
                                <TableHead className="text-primary-foreground font-bold text-center" colSpan={attackPowerData.honorLevels.length}>Onore</TableHead>
                            </TableRow>
                            <TableRow className="bg-primary/70 hover:bg-primary/70">
                                {attackPowerData.honorLevels.map(level => (
                                    <TableHead key={level} className="text-primary-foreground text-center">{level}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attackPowerData.buildingLevels.map((row, index) => (
                                <TableRow key={index} className="bg-stone-200 hover:bg-stone-300/60">
                                    <TableCell className="font-semibold text-center">{row.level}</TableCell>
                                    {row.values.map((value, vIndex) => (
                                        <TableCell key={vIndex} className="text-center">{value}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
