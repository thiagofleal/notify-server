import { Response } from "express";
import { Notification, Project, SseNotifier } from "../../notifier";

export function registerProject(name: string, authUrl?: string): boolean {
  return Project.register(name, authUrl);
}

export function getEvents(projectId: string, id: string, retry: number, response: Response): void {
  const project = Project.get(projectId);

  if (project) {
    project.registerSession(id);

    const notifier = project.getSession(id);

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
    }
  } else {
    response.status(404).send({
      error: 1,
      message: "Project not found"
    })
  }
}

export function notify(project: string, notification: Notification): void {
  if (notification.where?.["session"]) {
    Project.get(project)?.getSession(notification.where?.["session"])?.notify(notification);
  }
}
