
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TechTreeTable } from "./tech-tree-table";
import { roomsTechData, trainingTechData, troopsTechData } from "./tech-tree-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TechTreePage() {
  return (
    <div className="space-y-4">
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-2 px-4">
                <CardTitle className="text-lg text-primary-foreground">
                    Árbol Tecnológico
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <Tabs defaultValue="rooms">
                    <div className="flex justify-between items-start">
                        <TabsList className="bg-stone-300">
                            <TabsTrigger value="rooms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Habitaciones</TabsTrigger>
                            <TabsTrigger value="training" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Entrenamientos</TabsTrigger>
                            <TabsTrigger value="troops" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tropas</TabsTrigger>
                        </TabsList>
                        <div className="text-sm text-right">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-dashed border-green-500"></div>
                                <span>Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-dashed border-red-500"></div>
                                <span>No disponible</span>
                            </div>
                        </div>
                    </div>
                    <TabsContent value="rooms">
                        <TechTreeTable data={roomsTechData} />
                    </TabsContent>
                    <TabsContent value="training">
                        <TechTreeTable data={trainingTechData} />
                    </TabsContent>
                    <TabsContent value="troops">
                        <TechTreeTable data={troopsTechData} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
