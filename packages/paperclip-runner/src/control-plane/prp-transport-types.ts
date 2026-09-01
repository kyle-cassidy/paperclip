export interface DurableRecoveryIdentity {
  runnerInstanceId: string;
  environmentLeaseId: string;
  runId: string;
  normalizedSessionId: string;
  turnId: string;
  itemId: string;
}

export interface DurableRecoveryCoreCommand {
  schema: "paperclip.prp.command.v1";
  commandId: string;
  controllerSeq: number;
  type: string;
  issuedAt: string;
  payload: Record<string, unknown>;
  // The runner reports "indeterminate" when it recovers a command that it
  // journaled but did not confirm as executed before an earlier crash. It
  // replays the stored result instead of running the command again.
  status: "pending" | "completed" | "failed" | "rejected" | "indeterminate";
  result: Record<string, unknown> | null;
}

export interface DurableRecoveryCommittedEvent {
  sourceSeq: number;
  sourceEventId: string;
  eventType: string;
  priority: 0 | 1 | 2;
  envelope: Record<string, unknown>;
  deliveryCount: number;
  logicalEffectCount: number;
}
