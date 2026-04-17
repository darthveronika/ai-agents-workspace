export type AgentRole = 'coordinator' | 'researcher' | 'analyst' | 'writer' | 'reviewer';
export type AgentStatus = 'idle' | 'working' | 'done';

export interface LogEntry {
  id: string;
  agent: AgentRole;
  message: string;
  time: string;
}