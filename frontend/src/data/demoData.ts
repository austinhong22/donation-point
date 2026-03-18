import type { BalanceCard, HistoryItem, Role, TimelineItem } from '../types/demo';

export const roles: Role[] = ['DONOR', 'CHARITY_MANAGER', 'ADMIN'];

export const balanceCards: BalanceCard[] = [
  { label: 'Total donated', value: '120,000 KRW', tone: 'primary' },
  { label: 'Points available', value: '98,000 pt', tone: 'accent' },
  { label: 'Fulfilled orders', value: '3', tone: 'neutral' },
];

export const historyItems: HistoryItem[] = [
  {
    id: 'history-1',
    title: 'Mock payment received',
    detail: 'Donor remittance accepted and waiting for conversion.',
    amount: '+120,000 KRW',
    status: 'COMPLETED',
  },
  {
    id: 'history-2',
    title: 'Donation points converted',
    detail: 'Payment converted into donation points for donor wallet.',
    amount: '+120,000 pt',
    status: 'COMPLETED',
  },
  {
    id: 'history-3',
    title: 'Allocation to Green Shelter',
    detail: 'Donor allocated points to a selected charity.',
    amount: '-80,000 pt',
    status: 'COMPLETED',
  },
  {
    id: 'history-4',
    title: 'Partner goods purchase',
    detail: 'Charity manager used allocated points for hygiene kits.',
    amount: '-60,000 pt',
    status: 'FULFILLING',
  },
];

export const timelineItems: TimelineItem[] = [
  {
    id: 'timeline-1',
    stage: 'Mock payment',
    owner: 'DONOR',
    status: 'DONE',
    description: 'Donor completes a local-only mock payment/remittance.',
  },
  {
    id: 'timeline-2',
    stage: 'Point conversion',
    owner: 'DONOR',
    status: 'DONE',
    description: 'Payment is converted into donation points with ledger traceability.',
  },
  {
    id: 'timeline-3',
    stage: 'Charity allocation',
    owner: 'DONOR',
    status: 'DONE',
    description: 'Donor allocates points to a selected charity.',
  },
  {
    id: 'timeline-4',
    stage: 'Partner goods order',
    owner: 'CHARITY_MANAGER',
    status: 'ACTIVE',
    description: 'Charity manager uses allocated points to buy partner goods.',
  },
  {
    id: 'timeline-5',
    stage: 'Fulfillment completion',
    owner: 'ADMIN',
    status: 'NEXT',
    description: 'Admin marks the partner order fulfilled.',
  },
];
