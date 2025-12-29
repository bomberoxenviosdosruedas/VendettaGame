import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Notices() {
    return (
        <section>
            <Card className="border-primary bg-card text-card-foreground">
                <CardHeader className="bg-primary/80 py-2 px-4">
                    <CardTitle className="text-lg text-primary-foreground">AVISOS</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm bg-stone-200 text-black">
                    <p>EL JUEGO ES TOTALMENTE FUNCIONAL. SI ENCUENTRAS ALGÚN ERROR, POR FAVOR REPÓRTALO EN EL MÓDULO "REPORTAR UN BUG" O ENVÍA UN MENSAJE A administrator. SI ENCUENTRAS ALGUNA PALABRA SIN TRADUCIR, POR FAVOR REPÓRTALO EN EL MÓDULO "REPORTAR UN BUG".</p>
                </CardContent>
            </Card>
        </section>
    );
}
