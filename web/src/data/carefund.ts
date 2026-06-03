export type FundCategory = 
  | "HEALTH_MEDICAL" 
  | "EDUCATION" 
  | "COMMUNITY_DEVELOPMENT" 
  | "CHILDREN_YOUTH"
  | "ELDERLY_SUPPORT"
  | "DISASTER_RELIEF"
  | "FOOD_SECURITY"
  | "ENVIRONMENT";

export type UserRole =
  | "DONOR"
  | "BENEFICIARY"
  | "ORGANIZATION"
  | "ADMIN";

export const categoryLabels: Record<string, string> = {
  HEALTH_MEDICAL: "Health & Medical",
  EDUCATION: "Education",
  COMMUNITY_DEVELOPMENT: "Community Development",
  CHILDREN_YOUTH: "Children & Youth",
  ELDERLY_SUPPORT: "Elderly Support",
  DISASTER_RELIEF: "Disaster Relief",
  FOOD_SECURITY: "Food Security",
  ENVIRONMENT: "Environment"
};

export const categorySummaries: Record<string, string> = {
  HEALTH_MEDICAL: "Dental care, surgeries, medicines, and mental health support.",
  EDUCATION: "School supplies, tuition assistance, and classroom equipment.",
  COMMUNITY_DEVELOPMENT: "Water systems, solar energy, and infrastructure repair.",
  CHILDREN_YOUTH: "Child nutrition, youth development, and after-school programs.",
  ELDERLY_SUPPORT: "Senior healthcare, mobility assistance, and assisted living.",
  DISASTER_RELIEF: "Typhoon recovery, flood response, and emergency shelter.",
  FOOD_SECURITY: "Feeding programs, community kitchens, and agricultural support.",
  ENVIRONMENT: "Reforestation, waste management, and clean energy initiatives."
};

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
