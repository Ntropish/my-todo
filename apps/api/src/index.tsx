import { createApp } from "@reono/node-server";
import { type MiddlewareHandler } from "reono";
import UserRouter from "./users/router";
import TodoRouter from "./todos/router";
import z from "zod";

const port = z.coerce.number().parse(process.env.PORT ?? 8080);

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} (${duration}ms)`);
};

const App = () => {
  return (
    <use handler={logger}>
      <UserRouter />
      <TodoRouter />
    </use>
  );
};
const app = createApp();

app.serve(<App />);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
