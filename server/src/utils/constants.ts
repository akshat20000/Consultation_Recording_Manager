export const CONSULTATION_CATEGORIES = [
  'CareerPrediction',
  'RelationshipMatch',
  'HealthAstrology',
  'FinancialPlan',
  'NatalChartReading',
  'Other',
] as const;

export type ConsultationCategory = typeof CONSULTATION_CATEGORIES[number];
