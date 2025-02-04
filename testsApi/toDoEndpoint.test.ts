import { test, expect, request, APIRequestContext } from '@playwright/test';
import {
  newTodoPayload,
  updatedTodoPayload,
  invalidTodoData,
  invalidTodoUpdateData
} from '../testsApi/helpers/payloads';
import { verifyResponse } from '../testsApi/helpers/verifyResponse';

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const TEST_USER_ID = 1;

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

test.describe('Todos API', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Verify that ToDO list can be received', async () => {
    const response = await apiContext.get('/todos');
    console.log(`GET todos response status: ${response.status()}`);

    await verifyResponse(response, 200);

    const todos = (await response.json()) as Todo[];

    console.log(`GET todos response body (first 2 items): ${JSON.stringify(todos.slice(0, 2), null, 2)}`);

    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThan(0);
  });

  test('Filter todos filtered by userId', async () => {
    const response = await apiContext.get('/todos', { params: { userId: TEST_USER_ID } });
    console.log(`GET /todos?userId=${TEST_USER_ID} response status: ${response.status()}`);

    await verifyResponse(response, 200);

    const todos = (await response.json()) as Todo[];
    console.log(`GET /todos?userId=${TEST_USER_ID} response body: ${JSON.stringify(todos, null, 2)}`);

    expect(todos.length).toBeGreaterThan(0);
    todos.forEach(todo => {
      expect(todo.userId).toBe(TEST_USER_ID);
    });
  });

  test('Open a single todo with ID=1', async () => {
    const response = await apiContext.get('/todos/1');
    console.log(`GET /todos/1 response status: ${response.status()}`);

    await verifyResponse(response, 200);

    const todo = (await response.json()) as Todo;
    console.log(`GET /todos/1 response body: ${JSON.stringify(todo, null, 2)}`);

    expect(todo.id).toBe(1);
    expect(typeof todo.userId).toBe('number');
    expect(typeof todo.title).toBe('string');
    expect(typeof todo.completed).toBe('boolean');
  });

  test('Open not exisiting todo', async () => {
    const response = await apiContext.get('/todos/999999');

    console.log(`GET /todos/999999 response status: ${response.status()}`);

    expect(response.status()).toBe(404);
  });

  test('Create a new todo', async () => {
    const response = await apiContext.post('/todos', { data: newTodoPayload });

    console.log(`POST /todos response status: ${response.status()}`);

    await verifyResponse(response, 201);
    const createdTodo = (await response.json()) as Todo;
    console.log(`POST /todos response body: ${JSON.stringify(createdTodo, null, 2)}`);

    expect(createdTodo.id).toBeDefined();
    expect(createdTodo.userId).toBe(newTodoPayload.userId);
    expect(createdTodo.title).toBe(newTodoPayload.title);
    expect(createdTodo.completed).toBe(newTodoPayload.completed);
  });

  test('Updates an existing todo', async () => {
    const response = await apiContext.put('/todos/1', { data: updatedTodoPayload });

    console.log(`PUT todos/1 response status: ${response.status()}`);

    await verifyResponse(response, 200);
    const updatedTodo = (await response.json()) as Todo;

    console.log(`PUT /todos/1 response body: ${JSON.stringify(updatedTodo, null, 2)}`);

    expect(updatedTodo.userId).toBe(updatedTodoPayload.userId);
    expect(updatedTodo.title).toBe(updatedTodoPayload.title);
    expect(updatedTodo.completed).toBe(updatedTodoPayload.completed);
  });

  test('DELETE todos by Id ', async () => {
    const response = await apiContext.delete('/todos/1');

    console.log(`DELETE /todos/1 response status: ${response.status()}`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const deleteResult = await response.text();
    console.log(`DELETE /todos/1 response body: ${deleteResult || '[empty]'}`);
  });

  test.skip('Create todo with missing required fields', async () => {
    const response = await apiContext.post('/todos', { data: invalidTodoData });

    console.log(`POST /todos (invalid payload) response status: ${response.status()}`);

    expect(response.status()).toBe(400);
    const errorResponse = await response.json();

    console.log(`POST /todos (invalid payload) error response: ${JSON.stringify(errorResponse, null, 2)}`);
    expect(errorResponse.message).toContain('validation');
  });

  test.skip('Update to do with invalid data', async () => {
    const response = await apiContext.put('/todos/1', { data: invalidTodoUpdateData });

    console.log(`PUT /todos/1 (invalid data) response status: ${response.status()}`);
    expect(response.status()).toBe(400);

    const errorResponse = await response.json();

    console.log(`PUT /todos/1 (invalid data) error response: ${JSON.stringify(errorResponse, null, 2)}`);
    expect(errorResponse.message).toContain('validation');
  });
});
