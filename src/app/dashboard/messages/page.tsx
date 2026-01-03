import { getMessages } from '@/lib/actions/messages';
import Inbox from '@/components/messages/Inbox';
import ComposeMessage from '@/components/messages/ComposeMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default async function MessagesPage() {
    const { inbox, sent, unreadCount } = await getMessages();

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Centro de Mensajes</h2>
                {unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount} nuevos
                    </span>
                )}
            </div>

            <Tabs defaultValue="inbox" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="inbox">Bandeja de Entrada ({inbox.length})</TabsTrigger>
                    <TabsTrigger value="sent">Enviados</TabsTrigger>
                    <TabsTrigger value="compose">Redactar</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="mt-4">
                    <Inbox messages={inbox} type="inbox" />
                </TabsContent>

                <TabsContent value="sent" className="mt-4">
                    <Inbox messages={sent} type="sent" />
                </TabsContent>

                <TabsContent value="compose" className="mt-4">
                    <ComposeMessage />
                </TabsContent>
            </Tabs>
        </div>
    );
}
