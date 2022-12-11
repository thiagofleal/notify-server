import { Response } from "express";
import { Notification, SseNotifier } from "../../notifier";

export function getEvents(id: string, retry: number, response: Response): void {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();
  response.write(`retry: ${ retry }\r\n\n`);

  const registData = SseNotifier.get(id).register(response);

  response.on("close", () => registData.unregister());
  response.on("error", () => registData.unregister());
  response.on("finish", () => registData.unregister());
}

export function notify(id: string, notification: Notification): void {
  SseNotifier.get(id).notify(notification);
}
