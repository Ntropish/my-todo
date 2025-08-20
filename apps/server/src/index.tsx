import { createApp } from "@reono/node-server";

import z from "zod";

import { App } from "@reono-todo/api";

const port = z.coerce.number().parse(process.env.PORT ?? 8080);

const app = createApp();

app.serve(<App />);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
