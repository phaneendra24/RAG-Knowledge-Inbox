import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className=" font-semibold text-lg text-center">
          AI knowledge Inbox
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className=" flex flex-col gap-3">
          <div className="w-full px-2">All Notes</div>
          <div className="w-full px-2">Saved URLs</div>
          <div className="w-full px-2">Ask AI</div>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
