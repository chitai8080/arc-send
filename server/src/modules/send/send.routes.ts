import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { SendController } from "./send.controller.js";
import { estimateSendSchema, executeSendSchema } from "./send.schemas.js";
import { SendService } from "./send.service.js";

export function createSendRouter() {
  const router = Router();
  const sendController = new SendController(new SendService());

  router.post("/estimate", validateBody(estimateSendSchema), sendController.estimate);
  router.post("/execute", validateBody(executeSendSchema), sendController.execute);

  return router;
}
