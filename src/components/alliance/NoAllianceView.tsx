'use client';

import { createAllianceAction, searchAlliances, joinAllianceAction } from '@/lib/actions/alliance';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function NoAllianceView() {
    return (
        <div className="container mx-auto p-4 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Sindicato / Alianza</h2>
            <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search">Buscar Alianza</TabsTrigger>
                    <TabsTrigger value="create">Fundar Alianza</TabsTrigger>
                </TabsList>

                <TabsContent value="search">
                    <AllianceSearch />
                </TabsContent>

                <TabsContent value="create">
                    <CreateAllianceForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function AllianceSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchAlliances(query);
            setResults(data || []);
        } catch (error) {
            toast({ title: 'Error', description: 'Error al buscar alianzas', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Buscar Alianza Existente</CardTitle>
                <CardDescription>Encuentra una alianza y solicita unirte a ella.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <Input
                        placeholder="Nombre o etiqueta..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>Buscar</Button>
                </form>

                <div className="space-y-4">
                    {results.map((alliance) => (
                        <Card key={alliance.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <h4 className="font-bold">[{alliance.etiqueta}] {alliance.nombre}</h4>
                                    <p className="text-sm text-muted-foreground">{alliance.descripcion}</p>
                                    <p className="text-xs mt-1">{alliance.miembros?.[0]?.count || 0} Miembros</p>
                                </div>
                                <JoinRequestDialog alliance={alliance} />
                            </CardContent>
                        </Card>
                    ))}
                    {results.length === 0 && query && !loading && (
                        <p className="text-center text-muted-foreground">No se encontraron resultados.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function JoinRequestDialog({ alliance }: { alliance: any }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleJoin = async () => {
        setLoading(true);
        const result = await joinAllianceAction(alliance.id, message);
        setLoading(false);

        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Solicitud enviada', description: `Has solicitado unirte a ${alliance.nombre}` });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Unirse</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Unirse a {alliance.nombre}</DialogTitle>
                    <DialogDescription>
                        Envía un mensaje al líder de la alianza para que acepte tu solicitud.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label>Mensaje de solicitud</Label>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Hola, me gustaría unirme a vuestra alianza..."
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleJoin} disabled={loading}>Enviar Solicitud</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CreateAllianceForm() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        const result = await createAllianceAction(formData);
        setLoading(false);

        if (result?.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Alianza creada', description: '¡Has fundado una nueva alianza!' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fundar Nueva Alianza</CardTitle>
                <CardDescription>Crea tu propio sindicato y recluta miembros.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nombre">Nombre de la Alianza</Label>
                        <Input id="nombre" name="nombre" placeholder="Ej: Los Soprano" required minLength={3} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="etiqueta">Etiqueta (Tag)</Label>
                        <Input id="etiqueta" name="etiqueta" placeholder="Ej: SOP" required minLength={2} maxLength={8} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="descripcion">Descripción Pública</Label>
                        <Textarea id="descripcion" name="descripcion" placeholder="Descripción de tu alianza..." />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>Fundar Alianza</Button>
                </form>
            </CardContent>
        </Card>
    );
}
