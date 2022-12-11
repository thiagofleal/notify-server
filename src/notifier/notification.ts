export type Notification = {
  id?: number;
  event?: string;
  expires?: number;
  data: Record<string, any>;
};
