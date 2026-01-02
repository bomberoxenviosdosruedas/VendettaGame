'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Crosshair, FlaskConical, Users, Zap } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card className="border-stone-200 shadow-sm">
      <CardHeader className="py-3 px-4 bg-stone-50 border-b border-stone-100">
        <CardTitle className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 px-3 text-xs" asChild>
            <Link href="/dashboard/map">
                <Map className="w-4 h-4 text-blue-600" />
                <span className="truncate">Mapa Global</span>
            </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 px-3 text-xs" asChild>
            <Link href="/dashboard/recruitment">
                <Users className="w-4 h-4 text-green-600" />
                <span className="truncate">Reclutar</span>
            </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 px-3 text-xs" asChild>
            <Link href="/dashboard/tech-tree">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                <span className="truncate">Investigar</span>
            </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 px-3 text-xs" asChild>
            <Link href="/dashboard/map?action=attack">
                <Crosshair className="w-4 h-4 text-red-600" />
                <span className="truncate">Atacar</span>
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
