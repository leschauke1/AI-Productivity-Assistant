export type TabId = 'email' | 'meeting' | 'planner';

export type Tone = 'professional' | 'friendly' | 'concise' | 'apologetic' | 'persuasive';

export type Priority = 'low' | 'medium' | 'high';

export type MeetingFormat = 'bullet' | 'narrative' | 'action-items';

export type AIProvider = 'mock' | 'openai';

export interface Settings {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface EmailResult {
  subject: string;
  body: string;
}

export interface MeetingResult {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; due: string }[];
}

export interface PlannerResult {
  tasks: {
    title: string;
    priority: Priority;
    duration: string;
    category: string;
    notes: string;
  }[];
  schedule: string;
  tips: string[];
}
