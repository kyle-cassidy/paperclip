import { Compass, Library, PencilRuler } from "lucide-react";
import { useLocation } from "@/lib/router";
import {
  resolveSkillsNavigationView,
  SKILLS_NAVIGATION_HREFS,
} from "@/pages/skills/skills-navigation";
import { ContextualSidebarFrame } from "./ContextualSidebarFrame";
import { SidebarNavItem } from "./SidebarNavItem";

export {
  resolveSkillsDiscoveryView,
  resolveSkillsNavigationView,
  SKILLS_NAVIGATION_HREFS,
  withSkillsDiscoveryView,
  type SkillsNavigationView,
} from "@/pages/skills/skills-navigation";

export function SkillsContextualSidebar() {
  const location = useLocation();
  const activeView = resolveSkillsNavigationView(location.pathname, location.search);

  return (
    <ContextualSidebarFrame
      surface="skills"
      title="Skills"
      icon={Library}
      fallbackTo="/dashboard"
    >
      <nav aria-label="Skills" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-2">
        <div className="flex flex-col gap-0.5">
          <SidebarNavItem
            to={SKILLS_NAVIGATION_HREFS.installed}
            label="Installed"
            icon={Library}
            active={activeView === "installed"}
            end
          />
          <SidebarNavItem
            to={SKILLS_NAVIGATION_HREFS.discover}
            label="Discover"
            icon={Compass}
            active={activeView === "discover"}
            end
          />
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <div className="px-2 pb-1 text-(length:--text-micro) font-medium uppercase tracking-wide text-muted-foreground">
            Author
          </div>
          <SidebarNavItem
            to={SKILLS_NAVIGATION_HREFS.authored}
            label="My Skills"
            icon={PencilRuler}
            active={activeView === "authored"}
          />
          <p className="px-4 pt-1 text-xs leading-5 text-muted-foreground">
            Skills you create, edit, and test.
          </p>
        </div>
      </nav>
    </ContextualSidebarFrame>
  );
}
