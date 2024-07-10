import { Router } from "express";
import ChatRouter from "./ChatRouter/ChatRouter.js";

const routes = Router();

routes.get("/", (req, res) => {
    res.send("Hello World");
});

routes.post("/chat", ChatRouter);

export default routes;