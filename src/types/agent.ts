export type AgentRole = 'coordinator' | 'researcher' | 'analyst' | 'writer' | 'reviewer';
export type AgentStatus = 'idle' | 'working' | 'done';

export interface TaskPayload {
  originalTask: string;
  keywords: string[];
  collectedData: string[];
  analysis: string;
  draft: string;
  finalOutput: string;
}

export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | 'user';
  action: string;
  changedFields: (keyof TaskPayload)[];
  summary: string;
  time: string;
}

export interface RoutingPlan {
  agents: AgentRole[];
  reason: string;
}