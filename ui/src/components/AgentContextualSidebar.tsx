import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BadgeDollarSign,
  BookOpenText,
  Bot,
  History,
  KeyRound,
  Library,
  PlayCircle,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { agentsApi } from "@/api/agents";
import { useCompany } from "@/context/CompanyContext";
import { queryKeys } from "@/lib/queryKeys";
import { ContextualSidebarFrame } from "./ContextualSidebarFrame";
import { SidebarNavItem } from "./SidebarNavItem";
import {
  AGENT_DETAIL_NAVIGATION,
  agentDetailHref,
  agentScopedAuditHref,
  type AgentLocalDetailView,
} from "@/pages/agent-detail-navigation";

const localIcons = {
  overview: Sparkles,
  instructions: BookOpenText,
  skills: Library,
  runtime: Settings2,
  secrets: ShieldCheck,
  tools: Wrench,
  permissions: ShieldCheck,
  "api-keys": KeyRound,
  revisions: History,
} satisfies Record<AgentLocalDetailView, typeof Sparkles>;

const auditItems = [
  { section: "activity", label: "Activity", icon: Activity },
  { section: "runs", label: "Runs", icon: PlayCircle },
  { section: "costs", label: "Costs", icon: ReceiptText },
  { section: "budgets", label: "Budgets", icon: BadgeDollarSign },
] as const;

export function AgentContextualSidebar({
  agentRef,
  agentId,
  agentName,
}: {
  agentRef: string;
  agentId?: string;
  agentName?: string;
}) {
  const { selectedCompanyId } = useCompany();
  const shouldResolveAgent = !agentId || !agentName;
  const { data: resolvedAgent } = useQuery({
    queryKey: [...queryKeys.agents.detail(agentRef), selectedCompanyId ?? null, "contextual-sidebar"],
    queryFn: () => agentsApi.get(agentRef, selectedCompanyId ?? undefined),
    enabled: shouldResolveAgent && Boolean(agentRef && selectedCompanyId),
  });
  const resolvedId = agentId ?? resolvedAgent?.id;
  const resolvedName = agentName ?? resolvedAgent?.name ?? "Agent";

  return (
    <ContextualSidebarFrame surface="agent" title={resolvedName} icon={Bot} fallbackTo="/agents/all">
      <nav aria-label={`${resolvedName} navigation`} className="min-h-0 flex-1 overflow-y-auto pb-4">
        {AGENT_DETAIL_NAVIGATION.map((section) => (
          <div key={section.label} className="mb-3">
            <p className="px-5 pb-1 pt-2 text-(length:--text-micro) font-medium uppercase tracking-wide text-muted-foreground">
              {section.label}
            </p>
            {section.items.map((item) => {
              const href = agentDetailHref(agentRef, item.value);
              return (
                <SidebarNavItem
                  key={item.value}
                  to={href}
                  label={item.label}
                  icon={localIcons[item.value]}
                />
              );
            })}
          </div>
        ))}

        <div>
          <p className="px-5 pb-1 pt-2 text-(length:--text-micro) font-medium uppercase tracking-wide text-muted-foreground">
            Audit
          </p>
          {resolvedId ? auditItems.map((item) => (
            <SidebarNavItem
              key={item.section}
              to={agentScopedAuditHref(resolvedId, item.section)}
              label={item.label}
              icon={item.icon}
            />
          )) : (
            <p className="px-5 py-2 text-xs text-muted-foreground">Loading audit links…</p>
          )}
        </div>
      </nav>
    </ContextualSidebarFrame>
  );
}
