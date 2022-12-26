export type Notification = {
  id?: string;
  event?: string;
  expires?: number;
  data: Record<string, any>;
  where: Record<string, any>;
};
