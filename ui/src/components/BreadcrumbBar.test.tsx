// @vitest-environment jsdom

import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BreadcrumbBar } from "./BreadcrumbBar";

const breadcrumbState = vi.hoisted(() => ({
  breadcrumbs: [
    { label: "Tasks", href: "/issues" },
    {
      label: "Hire your first engineer and create a hiring plan",
      identifier: "TES-1",
      leading: "status",
    },
  ],
}));

vi.mock("@/lib/router", () => ({
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>{children}</a>
  ),
}));

vi.mock("../context/BreadcrumbContext", () => ({
  useBreadcrumbs: () => ({ breadcrumbs: breadcrumbState.breadcrumbs, mobileToolbar: null }),
}));

vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({
    collapsed: false,
    isMobile: false,
    toggleCollapsed: vi.fn(),
    toggleSidebar: vi.fn(),
  }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1", selectedCompany: { issuePrefix: "TES" } }),
}));

vi.mock("../context/PanelContext", () => ({
  usePanel: () => ({ panelVisible: true, togglePanelVisible: vi.fn() }),
}));

vi.mock("@/plugins/slots", () => ({
  PluginSlotOutlet: () => null,
  usePluginSlots: () => ({ slots: [] }),
}));

vi.mock("@/plugins/launchers", () => ({
  PluginLauncherOutlet: () => null,
  usePluginLaunchers: () => ({ launchers: [] }),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("BreadcrumbBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("appends the task identifier to the task title in the header", () => {
    act(() => root.render(<BreadcrumbBar taskDetailLayout />));

    const identifier = container.querySelector('[data-slot="task-title-identifier"]');
    expect(identifier).toBeTruthy();
    expect(identifier?.className).not.toContain("absolute");

    const title = Array.from(container.querySelectorAll("span"))
      .find((element) => element.textContent === breadcrumbState.breadcrumbs[1]?.label);
    expect(title?.className).toContain("truncate");
    expect(title?.nextElementSibling).toBe(identifier);
    expect(identifier?.textContent).toBe("TES-1");
  });
});
