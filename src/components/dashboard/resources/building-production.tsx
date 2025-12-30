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
import { buildingProductionData } from "./resources-data";
  
export function BuildingProduction() {
    const totals = buildingProductionData.buildings.reduce((acc, building) => {
        acc.armas += building.production.armas;
        acc.municion += building.production.municion;
        acc.alcohol += building.production.alcohol;
        acc.dolares += building.production.dolares;
        return acc;
    }, { ...buildingProductionData.baseSalary });

    return (
        <Card className="border-primary bg-stone-200 text-black overflow-hidden">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">Edificio 34:13:129 / Recursos / Hora</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-primary/70 hover:bg-primary/70">
                            <TableHead className="text-primary-foreground w-[200px]"></TableHead>
                            <TableHead className="text-primary-foreground text-center">Armas</TableHead>
                            <TableHead className="text-primary-foreground text-center">Munición</TableHead>
                            <TableHead className="text-primary-foreground text-center">Alcohol</TableHead>
                            <TableHead className="text-primary-foreground text-center">Dólares</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="bg-stone-200 hover:bg-stone-300/60">
                            <TableCell className="font-semibold">Salario base</TableCell>
                            <TableCell className="text-center text-green-600 font-bold">{buildingProductionData.baseSalary.armas}</TableCell>
                            <TableCell className="text-center text-green-600 font-bold">{buildingProductionData.baseSalary.municion}</TableCell>
                            <TableCell className="text-center text-green-600 font-bold">{buildingProductionData.baseSalary.alcohol}</TableCell>
                            <TableCell className="text-center">{buildingProductionData.baseSalary.dolares}</TableCell>
                        </TableRow>
                        {buildingProductionData.buildings.map((building) => (
                            <TableRow key={building.name} className="bg-stone-200 hover:bg-stone-300/60">
                                <TableCell className="font-semibold">{building.name} ({building.level})</TableCell>
                                <TableCell className={`text-center ${building.production.armas > 0 ? 'text-green-600 font-bold' : ''}`}>{building.production.armas}</TableCell>
                                <TableCell className={`text-center ${building.production.municion > 0 ? 'text-green-600 font-bold' : ''}`}>{building.production.municion}</TableCell>
                                <TableCell className={`text-center ${building.production.alcohol > 0 ? 'text-green-600 font-bold' : ''}`}>{building.production.alcohol}</TableCell>
                                <TableCell className={`text-center ${building.production.dolares > 0 ? 'text-green-600 font-bold' : ''}`}>{building.production.dolares}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-primary/20 hover:bg-primary/30">
                            <TableCell className="font-semibold text-center text-lg">=</TableCell>
                            <TableCell className="text-center text-green-600 font-bold">{totals.armas}</TableCell>
                            <TableCell className="text-center text-green-600 font-bold">{totals.municion}</TableCell>
                            <TableCell className="text-center text-green-600 font-bold">{totals.alcohol}</TableCell>
                            <TableCell className="text-center">{totals.dolares}</TableCell>
                        </TableRow>
                        <TableRow className="bg-stone-200 hover:bg-stone-300/60">
                            <TableCell className="font-semibold">Capacidad de Almacenamiento</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.capacity.armas.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.capacity.municion.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.capacity.alcohol.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.capacity.dolares.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow className="bg-stone-200 hover:bg-stone-300/60">
                            <TableCell className="font-semibold">Almacenados en forma segura</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.safe.armas.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.safe.municion.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.safe.alcohol.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{buildingProductionData.storage.safe.dolares.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}