import express from "express";
import { json } from "body-parser";

import { routes } from "./routes";

const app = express();
const port = parseInt(process.env.PORT || "3000");

app.use(json());
app.use(routes);

app.listen(port, () => {
  console.log(`Server started at port ${ port }`);
});
