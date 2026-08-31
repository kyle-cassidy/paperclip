import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SidebarNavExpandedProvider } from "./SidebarNavItem";

/**
 * Full-width content adapter for a contextual sidebar. Layout places this
 * inside the same resizable SidebarShell used by the global navigation; the
 * global rail is replaced rather than left visible beside it.
 */
export function SecondarySidebar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-secondary-sidebar=""
      className={cn(
        "h-full w-full min-w-0 overflow-hidden",
        className,
      )}
    >
      <SidebarNavExpandedProvider>{children}</SidebarNavExpandedProvider>
    </div>
  );
}
