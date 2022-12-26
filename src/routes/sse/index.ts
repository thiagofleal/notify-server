import { Router } from "express";
import { Notification } from "../../notifier";
import { getEvents, notify } from "./callbacks";
import { generateSession } from "./utils";

const router = Router();

router.get("/:project/notifications", (request, response) => {
  const querySession = request.query.session as string;
  const session = querySession || generateSession();
  const retry = parseInt((request.query.retry as string) || "3000");
  const project = request.params.project;

  getEvents(project, session, retry, response);

  if (!querySession) {
    const notification: Notification = {
      event: "id",
      data: { session },
      where: { session }
    };
    notify(project, notification);
  }
});

router.post("/:project/notify", (request, response) => {
  const notification = request.body as Notification;

  if (notification.data) {
    notify(request.params.project, notification);
    response.status(200).send({
      error: 0,
      message: "Notification sent successfully"
    });
  } else {
    response.status(400).send({
      error: 1,
      message: "Field \"data\" not informed"
    });
  }
});

export const sse = router;
