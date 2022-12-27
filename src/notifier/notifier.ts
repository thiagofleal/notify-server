import { Response } from "express";
import { Notification } from "./notification";

export type RegisterConnectionData = {
  index: number;
  connection: Response;
  unregister: () => void;
};

export class SseNotifier {
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

  constructor(
    private auth = true
  ) {}

  public setAuth(value: boolean): void {
    this.auth = value;
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
      if (!this.auth) {
        return resolve(false);
      }
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
