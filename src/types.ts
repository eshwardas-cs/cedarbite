export type OrderMode = "quick" | "scheduled";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  pricePaisa: number;
  category: string;
  available: boolean;
  quickAllowed: boolean;
  scheduledAllowed: boolean;
};
