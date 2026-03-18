export type Role = 'DONOR' | 'CHARITY_MANAGER' | 'ADMIN';

export interface BalanceCard {
  label: string;
  value: string;
  tone: 'primary' | 'accent' | 'neutral';
}

export interface HistoryItem {
  id: string;
  title: string;
  detail: string;
  amount: string;
  status: string;
}

export interface TimelineItem {
  id: string;
  stage: string;
  owner: Role;
  status: 'DONE' | 'ACTIVE' | 'NEXT';
  description: string;
}
