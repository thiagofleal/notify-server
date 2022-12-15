import { Response } from "express";
import { Notification } from "./notification";

export type RegisterConnectionData = {
  index: number;
  connection: Response;
  unregister: () => void;
};

export class SseNotifier {
  private static instance: Record<string, Record<string, SseNotifier>> = {};

  public static get(project: string, id: string): SseNotifier | null {
    if (!this.instance[project]) {
      return null;
    }
    if (!this.instance[project][id]) {
      this.instance[project][id] = new this();
    }
    return this.instance[project][id];
  }

  private notificationsRecord: Record<number, Notification> = {};
  private connectionsRecord: Record<number, Response> = {};
  private nextNotificationIndex = 1;
  private nextConnectionIndex = 1;

  public get notifications(): Notification[] {
    const ret: Notification[] = [];

    for (const key in this.notificationsRecord) {
      ret.push(this.notificationsRecord[key]);
    }
    return ret;
  }

  public get connections(): Response[] {
    const ret: Response[] = [];

    for (const key in this.connectionsRecord) {
      ret.push(this.connectionsRecord[key]);
    }
    return ret;
  }

  private constructor() {}

  public static registerProject(project: string): void {
    if (!this.instance[project]) {
      this.instance[project] = {};
    }
  }

  public registerConnection(connection: Response): RegisterConnectionData {
    const index = this.nextConnectionIndex++;
    this.connectionsRecord[index] = connection;
    this.sendNotifications();
    return { index, connection, unregister: () => this.unregister(index) };
  }

  public unregister(index: number): void {
    try {
      delete this.connectionsRecord[index];
    } catch (err) {}
  }

  public notify(notification: Notification): void {
    const index = this.nextNotificationIndex++;
    this.notificationsRecord[index] = notification;

    this.sendNotifications().then(ret => {
      if (!ret && notification.expires !== undefined) {
        setTimeout(() => {
          try {
            delete this.notificationsRecord[index];
          } catch (err) {}
        }, notification.expires);
      }
    });
  }

  private sendNotifications(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      const connections = this.connections;
      let ret = false;

      if (connections.length) {
        const notifications = this.notifications;

        this.notificationsRecord = {};

        for (const { id, event, data } of notifications) {
          for (const connection of connections) {
            const eventId = id || new Date().valueOf();
            const eventName = event || "message";
            const eventData = JSON.stringify(data);

            connection.write(
              `id: ${ eventId }\r\nevent: ${ eventName }\r\ndata: ${ eventData }\r\n\n`
            );
            ret = true;
          }
        }
      }
      resolve(ret);
    });
  }
}
