import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Link as LinkIcon, Plus, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '@/queries/api';
import { Button } from '@/components/ui/button';

interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  title: string | null;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export function AppSidebar() {
  const navigate = useNavigate();
  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });

  const conversations: Conversation[] = conversationsData?.data || [];

  const formatChatPreview = (conversation: Conversation) => {
    const title = conversation.title || 'New Chat';
    return title.length > 30 ? title.slice(0, 30) + '...' : title;
  };

  const handleNewChat = () => {
    navigate('/');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="font-semibold text-lg text-center py-2">
          AI Knowledge Inbox
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Button
              onClick={handleNewChat}
              className="w-full mb-4 justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <SidebarMenu>
              <SidebarGroupLabel>Sources</SidebarGroupLabel>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/notes">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>All Notes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/urls">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    <span>Saved URLs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {conversations.length > 0 && (
          <SidebarGroup className="flex-1 overflow-hidden">
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent className="overflow-y-auto">
              <SidebarMenu>
                {conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton asChild>
                      <Link to={`/?conversation=${conversation.id}`}>
                        <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {formatChatPreview(conversation)}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
