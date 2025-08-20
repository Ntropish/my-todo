import { z } from "zod";

const todos: Record<number, { id: number; title: string; completed: boolean }> =
  {
    1: { id: 1, title: "Buy milk", completed: false },
    2: { id: 2, title: "Walk the dog", completed: true },
    3: { id: 3, title: "Walk the other dog", completed: true },
  };

let nextId = 4;

const todoIdSchema = z.number();
const todoSchema = z.object({
  id: todoIdSchema,
  title: z.string().min(1),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof todoSchema>;

export const todoInputSchema = todoSchema.omit({ id: true });
export const todoCreateSchema = todoInputSchema;
export const todoUpdateSchema = todoInputSchema;
export const todoPatchSchema = todoSchema.partial();

export type TodoId = z.infer<typeof todoIdSchema>;
export type TodoPostInput = z.infer<typeof todoCreateSchema>;
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;
export type TodoPatchInput = z.infer<typeof todoPatchSchema>;

export const getAllTodos = () => {
  return Object.values(todos);
};

export const getTodo = (id: number) => {
  const todo = todos[id];
  if (!todo) {
    throw new Error(`Todo with id ${id} not found`);
  }
  return todo;
};

export const postTodo = (input: TodoPostInput) => {
  const newTodo: Todo = {
    id: nextId++,
    title: input.title,
    completed: input.completed ?? false,
  };
  todos[newTodo.id] = newTodo;
  return newTodo;
};

export const putTodo = (id: number, input: TodoUpdateInput) => {
  const existing = todos[id];
  if (!existing) {
    throw new Error(`Todo with id ${id} not found`);
  }
  const updated: Todo = {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.completed !== undefined ? { completed: input.completed } : {}),
  };
  todos[id] = updated;
  return updated;
};

export const patchTodo = (id: number, patch: TodoPatchInput) => {
  const existing = todos[id];
  if (!existing) {
    throw new Error(`Todo with id ${id} not found`);
  }
  const updated: Todo = {
    ...existing,
    ...patch,
  };
  todos[id] = updated;
  return updated;
};

export const deleteTodo = (id: number) => {
  if (!todos[id]) {
    throw new Error(`Todo with id ${id} not found`);
  }
  delete todos[id];
  return { message: `Todo with id ${id} deleted` };
};
