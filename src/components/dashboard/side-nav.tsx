'use client'

import React from "react";
import Link from "next/link";
import { Bell, BookOpen, Building, ChevronDown, Castle, Crosshair, FileText, Globe, Hand, HelpCircle, Home, LogOut, Map, MessageSquare, Scale, Search, Settings, Shield, Swords, Users, Warehouse, Eye } from "lucide-react";
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "./sign-out-button";
import { ClientSelect } from "@/components/ui/client-select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <div className="flex flex-col h-full bg-stone-900 text-stone-300">
            <SidebarHeader className="bg-stone-950 p-4 text-center border-b border-stone-800">
                <h2 className="font-bold text-xl text-primary font-headline tracking-wider">VENDETTA</h2>
                <p className="text-xs text-stone-500 font-mono mt-1">{currentDate}</p>
            </SidebarHeader>
            
            <SidebarContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <SidebarMenu className="p-2 gap-1">
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.name}>
                                {item.isSearch ? (
                                    <div className="p-2 my-2 border border-stone-800 rounded bg-stone-950/50">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Search className="h-4 w-4 text-stone-500" />
                                            <div className="flex-1">
                                                 <ClientSelect />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link href={item.href} passHref onClick={handleLinkClick} className="w-full">
                                    <SidebarMenuButton 
                                        className={`w-full justify-start h-10 px-3 transition-all duration-200 
                                            ${item.highlight 
                                                ? 'bg-primary/20 text-primary hover:bg-primary/30 border-l-2 border-primary' 
                                                : 'hover:bg-stone-800 hover:text-white border-l-2 border-transparent hover:border-stone-600'
                                            }`}
                                    >
                                        <item.icon className={`h-4 w-4 mr-3 ${item.highlight ? 'text-primary' : 'text-stone-500 group-hover:text-stone-300'}`} />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </SidebarMenuButton>
                                    </Link>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </ScrollArea>
            </SidebarContent>

            <div className="mt-auto border-t border-stone-800 bg-stone-950 p-4">
                <div className="mb-4 px-2">
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Cuenta</p>
                    <p className="text-sm text-stone-300 truncate font-mono" title={userEmail}>
                        {userEmail || 'Invitado'}
                    </p>
                </div>
                <SignOutButton />
            </div>
        </div>
    );
}
