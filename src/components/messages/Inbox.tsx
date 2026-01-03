'use client';

import { Message } from '@/types/messages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteMessageAction, markAsReadAction } from '@/lib/actions/messages';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Trash2, MailOpen } from 'lucide-react';

export default function Inbox({ messages, type }: { messages: Message[], type: 'inbox' | 'sent' }) {
    if (messages.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No hay mensajes.</p>;
    }

    return (
        <div className="space-y-2">
            {messages.map(msg => (
                <MessageItem key={msg.id} message={msg} type={type} />
            ))}
        </div>
    );
}

function MessageItem({ message, type }: { message: Message, type: 'inbox' | 'sent' }) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [isRead, setIsRead] = useState(message.leido);

    const handleRead = async () => {
        if (!isOpen && !isRead && type === 'inbox') {
            await markAsReadAction(message.id);
            setIsRead(true);
        }
        setIsOpen(!isOpen);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await deleteMessageAction(message.id);
        if (res?.error) toast({ title: 'Error', description: res.error, variant: 'destructive' });
        else toast({ title: 'Borrado', description: 'Mensaje eliminado.' });
    };

    return (
        <Card className={`${!isRead && type === 'inbox' ? 'border-l-4 border-l-primary bg-muted/10' : ''}`}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleRead}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}

                            <div className="flex flex-col">
                                <span className="font-bold truncate">
                                    {type === 'inbox' ? message.remitente?.nombre_usuario || 'Sistema' : `Para: ${message.destinatario?.nombre_usuario}`}
                                </span>
                                <span className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-md">
                                    {message.asunto}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(message.creado_en).toLocaleDateString()}
                            </span>
                            {!isRead && type === 'inbox' && <Badge variant="default" className="h-2 w-2 rounded-full p-0" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 border-t mt-2">
                        <div className="py-4 whitespace-pre-wrap text-sm">
                            {message.cuerpo}
                        </div>
                        <div className="flex justify-end gap-2">
                            {type === 'inbox' && (
                                <Button variant="outline" size="sm" onClick={() => {/* Reply logic future */}}>Responder</Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive/90">
                                <Trash2 className="h-4 w-4 mr-1" /> Borrar
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
