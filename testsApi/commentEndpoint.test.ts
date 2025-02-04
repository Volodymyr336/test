import { test, expect, request, APIRequestContext } from '@playwright/test';
import { newCommentPayload, updatedCommentPayload, invalidCommentData, invalidUpdateData } from '../testsApi/helpers/payloads';
import { verifyResponse } from '../testsApi/helpers/verifyResponse';

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const TEST_EMAIL = 'Eliseo@gardner.biz';

// Structure of a Comment object
interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

test.describe('Comments API', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Verify that list of comments can be received', async () => {
    await test.step('Send GET request to /comments', async () => {
      const response = await apiContext.get('/comments');
      console.log(`GET /comments response status: ${response.status()}`);
      
      await verifyResponse(response, 200);

      // Parse the response as JSON and assert it matches our Comment interface
      const comments = (await response.json()) as Comment[];
      
      console.log(`GET /comments response body (first 2 items): ${JSON.stringify(comments.slice(0, 2), null, 2)}`);

      // Make sure we received an array with at least one comment
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThan(0);

      // Check that the first comment has the correct data types
      const firstComment = comments[0];
      expect(typeof firstComment.id).toBe('number');
      expect(typeof firstComment.name).toBe('string');
      expect(typeof firstComment.email).toBe('string');
      expect(typeof firstComment.body).toBe('string');
    });
  });

  test('Search comment by email', async () => {
    await test.step('Send GET request with email query parameter', async () => {
       const response = await apiContext.get('/comments', { params: { email: TEST_EMAIL } });
      console.log(`GET /comments?email=${TEST_EMAIL} response status: ${response.status()}`);
      
      await verifyResponse(response, 200);

      const comments = (await response.json()) as Comment[];
      console.log(`GET /comments?email=${TEST_EMAIL} response body: ${JSON.stringify(comments, null, 2)}`);

      expect(comments.length).toBeGreaterThan(0);
      comments.forEach((comment) => {
        expect(comment.email).toBe(TEST_EMAIL);
      });
    });
  });


  test('Open comment by Id', async () => {
    await test.step('Send GET request to /comments/1', async () => {

      const response = await apiContext.get('/comments/1');

      console.log(`GET /comments/1 response status: ${response.status()}`);
      
      await verifyResponse(response, 200);

      const comment = (await response.json()) as Comment;
      console.log(`GET /comments/1 response body: ${JSON.stringify(comment, null, 2)}`);

      // Assert that the comment has id 1
      expect(comment.id).toBe(1);
      expect(comment.postId).toBe(1);
      expect(typeof comment.name).toBe('string');
      expect(typeof comment.email).toBe('string');
    });
  });

  test('Open not existing comment', async () => {
    await test.step('Send GET request for a non-existent comment', async () => {
      const response = await apiContext.get('/comments/999999');
      console.log(`GET /comments/999999 response status: ${response.status()}`);
      
      expect(response.status()).toBe(404);
    });
  });

  test('Create a new comment', async () => {
    await test.step('Send POST request to create a new comment', async () => {
      const response = await apiContext.post('/comments', { data: newCommentPayload });
      console.log(`POST /comments response status: ${response.status()}`);
      
      await verifyResponse(response, 201);

      const createdComment = (await response.json()) as Comment;
      console.log(`POST /comments response body: ${JSON.stringify(createdComment, null, 2)}`);

      expect(createdComment.id).toBeDefined();
      expect(createdComment.postId).toBe(newCommentPayload.postId);
      expect(createdComment.name).toBe(newCommentPayload.name);
      expect(createdComment.email).toBe(newCommentPayload.email);
      expect(createdComment.body).toBe(newCommentPayload.body);
    });
  });

  test('Updates an existing comment', async () => {
    await test.step('Send PUT request to update comment with ID=1', async () => {
      const response = await apiContext.put('/comments/1', { data: updatedCommentPayload });
      console.log(`PUT /comments/1 response status: ${response.status()}`);
      
      await verifyResponse(response, 200);

      const updatedComment = (await response.json()) as Comment;
      console.log(`PUT /comments/1 response body: ${JSON.stringify(updatedComment, null, 2)}`);

      expect(updatedComment.postId).toBe(updatedCommentPayload.postId);
      expect(updatedComment.name).toBe(updatedCommentPayload.name);
      expect(updatedComment.email).toBe(updatedCommentPayload.email);
      expect(updatedComment.body).toBe(updatedCommentPayload.body);
    });
  });

  test('Delete comment by ID', async () => {
    await test.step('Send DELETE request to remove comment with ID=1', async () => {
      const response = await apiContext.delete('/comments/1');
      console.log(`DELETE /comments/1 response status: ${response.status()}`);
      
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const deleteResult = await response.text();
      console.log('DELETE response body:', deleteResult || '[empty]');
    });
  });

  // Extra Test Cases for Validation
  // JSONPlaceholder is a fake API and does not support validation errors

  test.skip('Create comment with missing required fields should return 400', async () => {
    await test.step('Send POST request with invalid payload (missing fields)', async () => {

      // Send the POST request with the invalid payload
      const response = await apiContext.post('/comments', { data: invalidCommentData });
      console.log(`POST /comments (invalid payload) response status: ${response.status()}`);
      
      expect(response.status()).toBe(400);

      const errorResponse = await response.json();
      console.log('POST /comments (invalid payload) error response:', JSON.stringify(errorResponse, null, 2));
      expect(errorResponse.message).toContain('validation');
    });
  });

  test.skip('Update comment with invalid data', async () => {
    await test.step('Send PUT request with invalid data types', async () => {

      const response = await apiContext.put('/comments/1', { data: invalidUpdateData });
      console.log(`PUT /comments/1 (invalid data) response status: ${response.status()}`);
      
      expect(response.status()).toBe(400);

      const errorResponse = await response.json();
      console.log('PUT /comments/1 (invalid data) error response:', JSON.stringify(errorResponse, null, 2));
      expect(errorResponse.message).toContain('validation');
    });
  });
});
