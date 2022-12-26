import { Response } from "express";
import { Notification, SseNotifier } from "../../notifier";

export function getEvents(project: string, id: string, retry: number, response: Response): void {
  const notifier = SseNotifier.get(project, id);

  if (notifier) {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders();
    response.write(`retry: ${ retry }\r\n\n`);
  
    const registData = notifier.registerConnection(response);
  
    response.on("close", () => registData?.unregister());
    response.on("error", () => registData?.unregister());
    response.on("finish", () => registData?.unregister());
  } else {
    response.status(404).send({
      error: 1,
      message: "Project or ID not found"
    })
  }
}

export function notify(project: string, notification: Notification): void {
  if (notification.where?.["session"]) {
    SseNotifier.get(project, notification.where?.["session"])?.notify(notification);
  }
}
