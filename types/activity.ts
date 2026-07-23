export type ActivityStatus = "available" | "coming-soon";

export type Activity = {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: ActivityStatus;
};
