'use client'

import React from "react";
import Link from "next/link";
import { Bell, BookOpen, Building, ChevronDown, Castle, Crosshair, FileText, Globe, Hand, HelpCircle, Home, LogOut, Map, MessageSquare, Scale, Search, Settings, Shield, Swords, Users, Warehouse, Eye } from "lucide-react";
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "./sign-out-button";
import { ClientSelect } from "@/components/ui/client-select";

const menuItems = [
    { name: "Nueva alerta", icon: Bell, href: "/dashboard/alerts", highlight: true },
    { name: "Vision general", icon: Home, href: "/dashboard" },
    { name: "Visión Global", icon: Eye, href: "/dashboard/overview" },
    { name: "Habitaciones", icon: Building, href: "/dashboard/rooms" },
    { name: "Reclutamiento", icon: Users, href: "/dashboard/recruitment" },
    { name: "Seguridad", icon: Shield, href: "/dashboard/security" },
    { name: "Entrenamiento", icon: Crosshair, href: "/dashboard/training" },
    { name: "Edificios", icon: Castle, href: "/dashboard/buildings" },
    { name: "Recursos", icon: Warehouse, href: "/dashboard/resources" },
    { name: "Arbol Tecnologico", icon: FileText, href: "/dashboard/tech-tree" },
    { name: "Buscar", icon: Search, href: "/dashboard/search", isSearch: true },
    { name: "Familia", icon: Users, href: "/dashboard/family" },
    { name: "Mapa", icon: Map, href: "/dashboard/map" },
    { name: "Simulador", icon: Globe, href: "/dashboard/simulator" },
    { name: "Mercado", icon: Hand, href: "/dashboard/market" },
    { name: "Misiones", icon: FileText, href: "/dashboard/missions" },
    { name: "Mensajes", icon: MessageSquare, href: "/dashboard/messages" },
    { name: "Chat", icon: Globe, href: "/dashboard/chat" },
    { name: "Guerras", icon: Swords, href: "/dashboard/wars" },
    { name: "Records", icon: BookOpen, href: "/dashboard/records" },
    { name: "Batallas", icon: Crosshair, href: "/dashboard/battles" },
    { name: "Clasificacion", icon: Scale, href: "/dashboard/ranking" },
    { name: "Opciones", icon: Settings, href: "/dashboard/options" },
];


export function SideNav({ userEmail }: { userEmail: string | undefined }) {
    const { setOpenMobile } = useSidebar();
    const [currentDate, setCurrentDate] = React.useState('');

    React.useEffect(() => {
        const updateDate = () => {
            const date = new Date().toLocaleString('en-US', {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(',', ' -');
            setCurrentDate(date.replace(/\//g, '.'));
        };

        updateDate();
        const intervalId = setInterval(updateDate, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const handleLinkClick = () => {
        setOpenMobile(false);
    }

    return (
        <div className="flex flex-col h-full">
            <SidebarHeader className="bg-stone-900/50 p-2 text-center border-b-2 border-black/30">
                <h2 className="font-bold text-lg">Menu</h2>
                <p className="text-xs text-stone-400">{currentDate}</p>
            </SidebarHeader>
            <SidebarContent className="flex-1">
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.name}>
                            {item.isSearch ? (
                                <div className="p-2 border-b border-stone-700">
                                    <div className="flex items-center gap-2 text-sm p-2 bg-stone-200 text-black rounded-sm">
                                        <item.icon className="h-4 w-4" />
                                        <span className="flex-1">Buscar</span>
                                        <ClientSelect />
                                    </div>
                                </div>
                            ) : (
                                <Link href={item.href} passHref onClick={handleLinkClick}>
                                  <SidebarMenuButton 
                                    className={`justify-start w-full border-b border-stone-700 rounded-none hover:bg-stone-700 transition-colors ${item.highlight ? 'bg-stone-600 font-bold' : ''}`}
                                  >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                  </SidebarMenuButton>
                                </Link>
                            )}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <Separator className="bg-black/30" />
            <div className="p-4 space-y-2 border-t-2 border-black/30">
                <p className="text-xs text-stone-400 truncate">Conectado como: {userEmail}</p>
                <SignOutButton />
            </div>
        </div>
    );
}
