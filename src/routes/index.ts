import { Router } from "express";

import { sse } from "./sse";

const router = Router();

router.use("/sse", sse);

export const routes = router;