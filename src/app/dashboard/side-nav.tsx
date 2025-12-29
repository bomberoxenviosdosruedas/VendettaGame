'use client'

import Link from "next/link";
import { Bell, BookOpen, Building, ChevronDown, Castle, Crosshair, FileText, Globe, Hand, HelpCircle, Home, LogOut, Map, MessageSquare, Scale, Search, Settings, Shield, Swords, Users, Warehouse } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const menuItems = [
    { name: "Nueva alerta", icon: Bell, href: "/dashboard/alerts", highlight: true },
    { name: "Vision general", icon: Home, href: "/dashboard" },
    { name: "Habitaciones", icon: Building, href: "/dashboard/rooms" },
    { name: "Reclutamiento", icon: Users, href: "/dashboard/recruitment" },
    { name: "Seguridad", icon: Shield, href: "/dashboard/security" },
    { name: "Entrenamiento", icon: Crosshair, href: "/dashboard/training" },
    { name: "Edificios", icon: Castle, href: "/dashboard/buildings" },
    { name: "Buscar", icon: Search, href: "/dashboard/search", isSearch: true },
    { name: "Arbol Tecnologico", icon: FileText, href: "/dashboard/tech-tree" },
    { name: "Famiglia", icon: Users, href: "/dashboard/family" },
    { name: "Recursos", icon: Warehouse, href: "/dashboard/resources" },
    { name: "Mapa", icon: Map, href: "/dashboard/map" },
    { name: "Simulatore", icon: Globe, href: "/dashboard/simulator" },
    { name: "Mercado", icon: Hand, href: "/dashboard/market" },
    { name: "Misiones", icon: FileText, href: "/dashboard/missions" },
    { name: "Mensajes", icon: MessageSquare, href: "/dashboard/messages" },
    { name: "Chat Globale", icon: Globe, href: "/dashboard/chat" },
    { name: "Guerras", icon: Swords, href: "/dashboard/wars" },
    { name: "Records", icon: BookOpen, href: "/dashboard/records" },
    { name: "Batallas", icon: Crosshair, href: "/dashboard/battles" },
    { name: "Clasificacion", icon: Scale, href: "/dashboard/ranking" },
    { name: "Regole Gioco", icon: BookOpen, href: "/dashboard/rules" },
    { name: "Opciones", icon: Settings, href: "/dashboard/options" },
    { name: "Segnala un Bug", icon: HelpCircle, href: "/dashboard/bug-report" },
    { name: "Salir", icon: LogOut, href: "/login", isAction: true },
];


export function SideNav() {
    const currentDate = new Date().toLocaleString('en-US', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).replace(',', ' -');

    return (
        <aside className="w-64 bg-stone-800 text-white flex flex-col border-r-2 border-black/30">
            <div className="bg-stone-900/50 p-2 text-center border-b-2 border-black/30">
                <h2 className="font-bold text-lg">Menu</h2>
                <p className="text-xs text-stone-400">{currentDate.replace(/\//g, '.')}</p>
            </div>
            <nav className="flex-1 overflow-y-auto">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            {item.isSearch ? (
                                <div className="p-2 border-b border-stone-700">
                                    <div className="flex items-center gap-2 text-sm p-2 bg-stone-200 text-black rounded-sm">
                                        <item.icon className="h-4 w-4" />
                                        <span className="flex-1">Buscar</span>
                                        <Select defaultValue="34:13:129">
                                            <SelectTrigger className="w-auto h-6 text-xs bg-white border-stone-400 focus:ring-0">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="34:13:129">34:13:129</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 p-2 text-sm border-b border-stone-700 hover:bg-stone-700 transition-colors ${item.highlight ? 'bg-stone-600 font-bold' : ''}`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-2 border-t-2 border-black/30 bg-stone-900/50">
                {/* Footer content if any */}
            </div>
        </aside>
    );
}
