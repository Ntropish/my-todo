import { z } from "zod";
import {
  getAllTodos,
  getTodo,
  postTodo,
  patchTodo,
  putTodo,
  deleteTodo,
  todoCreateSchema,
  todoUpdateSchema,
  todoPatchSchema,
} from "./repo";

export const TodoRouter = () => {
  return (
    <router path="todos">
      <get path="" handler={(c) => c.json(getAllTodos())} />
      <get
        path=":todoId"
        validate={{ params: z.object({ todoId: z.coerce.number() }) }}
        handler={(c) => c.json(getTodo(c.params.todoId))}
      />
      <post
        path=""
        validate={{ body: todoCreateSchema }}
        handler={(c) => postTodo(c.body)}
      />
      <put
        path=":todoId"
        validate={{
          body: todoUpdateSchema,
          params: z.object({ todoId: z.coerce.number() }),
        }}
        handler={(c) => putTodo(c.params.todoId, c.body)}
      />
      <patch
        path=":todoId"
        validate={{
          body: todoPatchSchema,
          params: z.object({ todoId: z.coerce.number() }),
        }}
        // handler={(c) => patchTodo(c.params.todoId, c.body)}
        // throw error for debugging
        handler={(c) => {
          throw new HTTPException.internalServerError({
            message: "Debugging patchTodo",
          });
        }}
        // handler={(c) => {
        //   throw new Error("Debugging patchTodo");
        // }}
      />
      <delete
        path=":todoId"
        validate={{ params: z.object({ todoId: z.coerce.number() }) }}
        handler={(c) => deleteTodo(c.params.todoId)}
      />
    </router>
  );
};

export default TodoRouter;
