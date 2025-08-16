import { createApp } from "@reono/node-server";
import { type MiddlewareHandler } from "reono";
import UserRouter from "./users/router";

const App = () => {
  return (
    <use handler={logger}>
      <UserRouter />
    </use>
  );
};
const app = createApp();

app.serve(<App />);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const { method } = c.req as Request;
  const url = (c.req as Request).url;

  await next();

  const duration = Date.now() - start;
  console.log(`${method} ${url} (${duration}ms)`);
};
