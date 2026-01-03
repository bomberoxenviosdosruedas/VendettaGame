'use client';

import { sendMessageAction } from '@/lib/actions/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ComposeMessage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await sendMessageAction(formData);
        setLoading(false);

        if (res?.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        } else {
            toast({ title: 'Mensaje enviado', description: 'El correo ha sido entregado.' });
            (e.target as HTMLFormElement).reset();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Redactar Mensaje</CardTitle>
                <CardDescription>Envía comunicaciones privadas a otros jugadores.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="destinatario">Para (Nombre de Usuario)</Label>
                        <Input id="destinatario" name="destinatario" required placeholder="Ej: DonCorleone" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="asunto">Asunto</Label>
                        <Input id="asunto" name="asunto" required placeholder="Propuesta de alianza..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cuerpo">Mensaje</Label>
                        <Textarea id="cuerpo" name="cuerpo" required className="min-h-[150px]" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Mensaje'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
