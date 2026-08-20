import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNotifications, markNotificationRead } from "@/lib/sales.functions";
import { 
  Bell, 
  Check, 
  CreditCard, 
  AlertCircle, 
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "@tanstack/react-router";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const fetchNotifications = useServerFn(getNotifications);
  const markReadFn = useServerFn(markNotificationRead);

  const { data: notificationsData = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(),
    refetchInterval: 30000, // Refresh every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markReadFn({ data: { notificationId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = (Array.isArray(notificationsData) ? notificationsData : []).filter((n: any) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'finance': return <Wallet className="h-4 w-4 text-[#D1127B]" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#D1127B]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-[#D1127B] text-white rounded-t-md">
          <h3 className="text-sm font-bold">Notifications</h3>
          <Badge variant="outline" className="text-white border-white">
            {unreadCount} nouvelles
          </Badge>
        </div>
        <ScrollArea className="h-[400px]">
          {(Array.isArray(notificationsData) ? notificationsData : []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {(Array.isArray(notificationsData) ? notificationsData : []).map((n: any) => (
                <div 
                  key={n.id} 
                  className={`p-4 hover:bg-muted/50 transition-colors relative ${!n.is_read ? 'bg-muted/20' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-xs font-bold ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground italic">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                        </span>
                        <div className="flex gap-2">
                          {!n.is_read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => markReadMutation.mutate(n.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}

                          {n.link && (
                            <Link to={n.link as any} onClick={() => setIsOpen(false)}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {(Array.isArray(notificationsData) ? notificationsData : []).length > 0 && (
          <div className="p-2 border-t text-center">
             <Button variant="link" size="sm" className="text-[10px] h-auto p-0 text-muted-foreground">
               Tout marquer comme lu
             </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
