import { z } from "zod";

const todos: Record<number, { id: number; title: string; completed: boolean }> =
  {
    1: { id: 1, title: "Buy milk", completed: false },
    2: { id: 2, title: "Walk the dog", completed: true },
  };

let nextId = 3;

const todoSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof todoSchema>;

// Define separate schemas for create and update
export const todoCreateSchema = z.object({
  title: z.string().min(1),
  completed: z.boolean().optional(),
});
export type TodoCreateInput = z.infer<typeof todoCreateSchema>;

export const todoUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;

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

export const createTodo = (input: TodoCreateInput) => {
  const newTodo: Todo = {
    id: nextId++,
    title: input.title,
    completed: input.completed ?? false,
  };
  todos[newTodo.id] = newTodo;
  return newTodo;
};

export const updateTodo = (id: number, input: TodoUpdateInput) => {
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

export const deleteTodo = (id: number) => {
  if (!todos[id]) {
    throw new Error(`Todo with id ${id} not found`);
  }
  delete todos[id];
  return { message: `Todo with id ${id} deleted` };
};
