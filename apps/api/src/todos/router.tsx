import { z } from "zod";
import {
  getAllTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  todoCreateSchema,
  todoUpdateSchema,
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
        handler={(c) => createTodo(c.body)}
      />
      <put
        path=":todoId"
        validate={{
          body: todoUpdateSchema,
          params: z.object({ todoId: z.coerce.number() }),
        }}
        handler={(c) => updateTodo(c.params.todoId, c.body)}
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
