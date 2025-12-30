
import {
    Card,
    CardContent,
    CardDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const buildings = [
    {
        coords: "[34:13:129]",
        name: "Edificio 1",
        underConstruction: {
            name: "Escuela de especialización",
            level: 1,
            time: "00:04:06",
        },
        needles: 76,
    },
];

export default function BuildingsPage() {
    return (
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-3 px-4">
                <CardTitle className="text-xl text-primary-foreground">
                    Gestión de Edificios y Colas
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 pt-1">
                    Monitorea el estado de tus edificios. Actualizaciones de construcción en tiempo real.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {/* Vista de tabla para pantallas grandes */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-primary/70 hover:bg-primary/70">
                                <TableHead className="text-primary-foreground">Coordinación</TableHead>
                                <TableHead className="text-primary-foreground">Nombre</TableHead>
                                <TableHead className="text-primary-foreground">Bajo construcción</TableHead>
                                <TableHead className="text-primary-foreground">Agujas</TableHead>
                                <TableHead className="text-primary-foreground">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {buildings.map((building, index) => (
                                <TableRow key={index} className="bg-stone-200 hover:bg-stone-300/60">
                                    <TableCell className="font-medium text-red-600">{building.coords}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <span>{building.name}</span>
                                            <div className="flex gap-1">
                                                <Input defaultValue="Rebautizar" className="h-8 text-xs w-28" />
                                                <Button variant="outline" size="sm" className="h-8 text-xs">Renombrar</Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-red-600 font-semibold">{building.underConstruction.name} (Niv. {building.underConstruction.level})</span>
                                            <span>{building.underConstruction.time}</span>
                                            <Link href="#" className="text-red-600 hover:underline text-xs">[X] Cancel</Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>{building.needles}</TableCell>
                                    <TableCell>
                                        <Button variant="destructive" size="sm" className="bg-accent hover:bg-accent/90">Cambiar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {/* Vista de tarjetas para pantallas pequeñas */}
                <div className="md:hidden p-4 space-y-4">
                    {buildings.map((building, index) => (
                        <div key={index} className="bg-stone-300/60 p-4 rounded-lg border border-primary/30 space-y-3">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Coordinación</p>
                                    <p className="font-medium text-red-600">{building.coords}</p>
                                </div>
                                <Button variant="destructive" size="sm" className="bg-accent hover:bg-accent/90">Cambiar</Button>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre</p>
                                <div className="flex flex-col gap-2 mt-1">
                                    <span>{building.name}</span>
                                    <div className="flex gap-1">
                                        <Input defaultValue="Rebautizar" className="h-8 text-xs w-full" />
                                        <Button variant="outline" size="sm" className="h-8 text-xs">Renombrar</Button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Bajo construcción</p>
                                <div className="flex flex-col mt-1">
                                    <span className="text-red-600 font-semibold">{building.underConstruction.name} (Niv. {building.underConstruction.level})</span>
                                    <span>{building.underConstruction.time}</span>
                                    <Link href="#" className="text-red-600 hover:underline text-xs self-start">[X] Cancel</Link>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Agujas</p>
                                <p>{building.needles}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
