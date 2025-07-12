import { FileText, Play, PenTool } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

interface SubtopicSidebarProps {
  currentSubunit: {
    id: string;
    title: string;
    skills: number[];
  } | null;
  onVideoClick: () => void;
  onArticleClick: () => void;
  onExerciseClick: () => void;
  currentView: string;
}

export function SubtopicSidebar({ 
  currentSubunit, 
  onVideoClick, 
  onArticleClick, 
  onExerciseClick,
  currentView 
}: SubtopicSidebarProps) {
  const { state } = useSidebar();

  if (!currentSubunit) return null;

  const getNavCls = (view: string) => 
    currentView === view ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar 
      className={isCollapsed ? "w-14" : "w-60"} 
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "text-xs" : ""}>
            {isCollapsed ? "Навигация" : currentSubunit.title}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onVideoClick}
                  className={getNavCls('video')}
                >
                  <Play className="h-4 w-4" />
                  {!isCollapsed && <span>Видео</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onArticleClick}
                  className={getNavCls('article')}
                >
                  <FileText className="h-4 w-4" />
                  {!isCollapsed && <span>Статья</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onExerciseClick}
                  className={getNavCls('exercise')}
                >
                  <PenTool className="h-4 w-4" />
                  {!isCollapsed && <span>Упражнения</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}