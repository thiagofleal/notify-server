import { Router } from "express";
import { Notification } from "../../notifier";
import { getEvents, notify } from "./callbacks";

const router = Router();

router.get("/:id", (request, response) => {
  getEvents(request.params.id, parseInt((request.query.retry as string) || "10000"), response);
});

router.post("/:id/notify", (request, response) => {
  const notification = request.body as Notification;

  if (notification.data) {
    notify(request.params.id, notification);
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
