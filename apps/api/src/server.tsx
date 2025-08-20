import UserRouter from "./users/router";
import TodoRouter from "./todos/router";
import type { MiddlewareHandler } from "reono";

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} (${duration}ms)`);
};

export const Api = () => {
  return (
    <use handler={logger}>
      <UserRouter />
      <TodoRouter />
    </use>
  );
};

export default Api;
