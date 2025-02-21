// Add PlanType to types
export type PlanType = 'operacional' | 'gerencial' | 'executivo';

export const PLAN_LIMITS: Record<PlanType, number> = {
  operacional: 25000,
  gerencial: 50000,
  executivo: 100000
};

export const PLAN_NAMES: Record<PlanType, string> = {
  operacional: 'Operacional',
  gerencial: 'Gerencial',
  executivo: 'Executivo'
};

// Rest of the types remain the same
export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isNew?: boolean;
  webhookUrl?: string;
}

// ... rest of the existing types
