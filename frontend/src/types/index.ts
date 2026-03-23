export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'transcribed' | 'summarized';
  audioUrl?: string;
  transcript?: string;
  summary?: MeetingSummary;
  contact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSummary {
  actionItems: ActionItem[];
  dates: DateExtracted[];
  amounts: AmountExtracted[];
  deliverables: string[];
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
}

export interface DateExtracted {
  id: string;
  date: string;
  context: string;
}

export interface AmountExtracted {
  id: string;
  amount: string;
  context: string;
}

export type CommitmentStatus = 'open' | 'fulfilled' | 'overdue';

export interface Commitment {
  id: string;
  text: string;
  status: CommitmentStatus;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  contact?: string;
  deadline?: string;
  amount?: string;
  owner?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface Stats {
  totalMeetings: number;
  totalCommitments: number;
  openCommitments: number;
  fulfilledCommitments: number;
  overdueCommitments: number;
  thisMonth: number;
  freeLimit: number;
  plan: 'free' | 'pro' | 'team';
}

export interface CommitmentFilters {
  status?: CommitmentStatus | '';
  contact?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'deadline' | 'createdAt' | 'amount';
}

export interface Settings {
  openAiKey?: string;
  notionApiKey?: string;
  notionPageId?: string;
  slackWebhookUrl?: string;
  reminderEmail?: string;
  reminderEnabled?: boolean;
}
