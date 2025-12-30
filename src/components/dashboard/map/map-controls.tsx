"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MapControls() {
    return (
        <div className="bg-stone-300/80 p-4 rounded-md border border-primary/30 w-full max-w-md">
            <form className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="city" className="text-sm">Ciudad</Label>
                        <Input id="city" defaultValue="34" className="w-20 h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="neighborhood" className="text-sm">Barrio</Label>
                        <Input id="neighborhood" defaultValue="13" className="w-20 h-8" />
                    </div>
                </div>
                <Button type="submit" variant="outline" size="sm" className="h-8">Actualizar</Button>
            </form>
        </div>
    );
}
