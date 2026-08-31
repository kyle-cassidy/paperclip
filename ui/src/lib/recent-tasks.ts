import type { Issue, IssueStatus } from "@paperclipai/shared";

export const RECENT_TASKS_LIMIT = 5;
export const RECENT_TASKS_UPDATED_EVENT = "paperclip:recent-tasks-updated";

export interface RecentTaskEntry {
  id: string;
  companyId: string;
  title: string;
  identifier: string | null;
  status: IssueStatus;
  recordedAt: number;
}

interface RecentTasksUpdatedDetail {
  storageKey: string;
  entries: RecentTaskEntry[];
}

export function getRecentTasksStorageKey(companyId: string, userId: string | null | undefined) {
  return `paperclip.recentTasks:${companyId}:${userId ?? "__local_board__"}`;
}

function isRecentTaskEntry(value: unknown, companyId: string): value is RecentTaskEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<RecentTaskEntry>;
  return entry.companyId === companyId
    && typeof entry.id === "string"
    && entry.id.length > 0
    && typeof entry.title === "string"
    && (entry.identifier === null || typeof entry.identifier === "string")
    && typeof entry.status === "string"
    && typeof entry.recordedAt === "number"
    && Number.isFinite(entry.recordedAt);
}

export function readRecentTasks(storageKey: string, companyId: string): RecentTaskEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed
      .filter((entry): entry is RecentTaskEntry => isRecentTaskEntry(entry, companyId))
      .sort((left, right) => right.recordedAt - left.recordedAt)
      .filter((entry) => {
        if (seen.has(entry.id)) return false;
        seen.add(entry.id);
        return true;
      })
      .slice(0, RECENT_TASKS_LIMIT);
  } catch {
    return [];
  }
}

function publishRecentTasks(storageKey: string, entries: RecentTaskEntry[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<RecentTasksUpdatedDetail>(RECENT_TASKS_UPDATED_EVENT, {
    detail: { storageKey, entries },
  }));
}

export function writeRecentTasks(storageKey: string, entries: RecentTaskEntry[]) {
  if (typeof window === "undefined") return;
  const bounded = entries.slice(0, RECENT_TASKS_LIMIT);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(bounded));
  } catch {
    // The in-tab event still keeps mounted navigation current for this session.
  }
  publishRecentTasks(storageKey, bounded);
}

export function recordRecentTask(
  issue: Pick<Issue, "id" | "companyId" | "title" | "identifier" | "status">,
  userId: string | null | undefined,
  recordedAt = Date.now(),
) {
  const storageKey = getRecentTasksStorageKey(issue.companyId, userId);
  const entry: RecentTaskEntry = {
    id: issue.id,
    companyId: issue.companyId,
    title: issue.title,
    identifier: issue.identifier,
    status: issue.status,
    recordedAt,
  };
  const current = readRecentTasks(storageKey, issue.companyId);
  writeRecentTasks(storageKey, [entry, ...current.filter((candidate) => candidate.id !== issue.id)]);
}

export function pruneRecentTasks(
  storageKey: string,
  companyId: string,
  removeIds: ReadonlySet<string>,
) {
  if (removeIds.size === 0) return;
  const current = readRecentTasks(storageKey, companyId);
  const next = current.filter((entry) => !removeIds.has(entry.id));
  if (next.length !== current.length) writeRecentTasks(storageKey, next);
}

export function updateRecentTaskSnapshots(
  storageKey: string,
  companyId: string,
  issues: ReadonlyArray<Pick<Issue, "id" | "companyId" | "title" | "identifier" | "status">>,
) {
  const issueById = new Map(issues.map((issue) => [issue.id, issue]));
  const current = readRecentTasks(storageKey, companyId);
  let changed = false;
  const next = current.map((entry) => {
    const issue = issueById.get(entry.id);
    if (!issue || issue.companyId !== companyId) return entry;
    if (
      issue.title === entry.title
      && issue.identifier === entry.identifier
      && issue.status === entry.status
    ) return entry;
    changed = true;
    return {
      ...entry,
      title: issue.title,
      identifier: issue.identifier,
      status: issue.status,
    };
  });
  if (changed) writeRecentTasks(storageKey, next);
}
