'use client';

import { updateSettingsAction } from '@/lib/actions/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SettingsForm({ settings }: { settings: any }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await updateSettingsAction(formData);
        setLoading(false);

        if (res?.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        } else {
            toast({ title: 'Guardado', description: 'Ajustes actualizados correctamente.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Cuenta</CardTitle>
                <CardDescription>Gestiona tu perfil y preferencias.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Nombre de Usuario</Label>
                        <Input value={settings?.nombre_usuario} disabled />
                        <p className="text-xs text-muted-foreground">El nombre de usuario no se puede cambiar.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatar_url">URL del Avatar</Label>
                        <Input
                            id="avatar_url"
                            name="avatar_url"
                            defaultValue={settings?.avatar_url || ''}
                            placeholder="https://imgur.com/..."
                        />
                    </div>

                    <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="space-y-0.5">
                            <Label>Modo Vacaciones</Label>
                            <p className="text-sm text-muted-foreground">
                                Detiene producción y ataques. Mínimo 2 días.
                            </p>
                        </div>
                        <Switch name="vacaciones" defaultChecked={settings?.vacaciones} />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
