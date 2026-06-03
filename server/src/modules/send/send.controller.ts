import type { RequestHandler } from "express";
import type { ExecuteSendInput, EstimateSendInput } from "./send.schemas.js";
import type { SendService } from "./send.service.js";

export class SendController {
  constructor(private readonly sendService: SendService) {}

  estimate: RequestHandler = async (req, res) => {
    const result = await this.sendService.estimate(req.body as EstimateSendInput);
    res.json(result);
  };

  execute: RequestHandler = async (req, res) => {
    const result = await this.sendService.execute(req.body as ExecuteSendInput);
    res.json(result);
  };
}
