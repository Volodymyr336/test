// File: helpers/verifyResponse.ts
import { expect, APIResponse } from '@playwright/test';

export async function verifyResponse(response: APIResponse, expectedStatus: number): Promise<void> {
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(expectedStatus);
  const headers = response.headers(); 
  expect(headers['content-type']).toContain('application/json');
}
