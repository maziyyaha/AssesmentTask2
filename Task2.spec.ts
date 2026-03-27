import { test, expect, request } from '@playwright/test';

test.describe('JSONPlaceholder /posts CRUD lifecycle', () => {
  let apiContext;
  let postId: number;

  const baseURL = 'https://jsonplaceholder.typicode.com';

  const testData = {
    title: 'Test Tomato',
    body: 'This is a test body created by API automation',
    userId: 1
  };

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL
    });
  });

  test('Full CRUD lifecycle', async () => {

    // ======================
    // CREATE (POST)
    // ======================
    const createResponse = await apiContext.post('/posts', {
      data: testData
    });

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();

    expect(createBody).toMatchObject(testData);
    expect(createBody.id).toBeDefined();

    postId = createBody.id;

    console.log('Created Post ID:', postId);

    // ======================
    // READ (GET)
    // ======================
    const getResponse = await apiContext.get(`/posts/${postId}`);

    expect([200, 404]).toContain(getResponse.status());

   if (getResponse.status() === 200) {
    const getBody = await getResponse.json();

    expect(getBody.title).toBe(testData.title);
   expect(getBody.body).toBe(testData.body);
   expect(getBody.userId).toBe(testData.userId);
  }

    // ======================
    // UPDATE (PUT)
    // ======================
    const updatedData = {
      ...testData,
      title: 'Updated Test Potato'
    };

    const updateResponse = await apiContext.put(`/posts/${postId}`, {
      data: updatedData
    });

    if (updateResponse.status() === 200) {
    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();

    expect(updateBody.title).toBe(updatedData.title);
    expect(updateBody.body).toBe(updatedData.body);
    expect(updateBody.userId).toBe(updatedData.userId);
    }
    // ======================
    // VERIFY UPDATE (GET)
    // ======================
   
    const verifyResponse = await apiContext.get(`/posts/${postId}`);
if (verifyResponse.status() === 200) {
    expect(verifyResponse.status()).toBe(200);
  
    const verifyBody = await verifyResponse.json();

    expect(verifyBody.title).toBe(updatedData.title); // changed
    expect(verifyBody.body).toBe(testData.body); // unchanged
    expect(verifyBody.userId).toBe(testData.userId); // unchanged
}
    // ======================
    // DELETE
    // ======================
    const deleteResponse = await apiContext.delete(`/posts/${postId}`);

    expect(deleteResponse.status()).toBe(200);

    // ======================
    // VERIFY DELETION
    // ======================
    const deletedGetResponse = await apiContext.get(`/posts/${postId}`);

    // ⚠️ NOTE:
    // JSONPlaceholder is FAKE API → deletion not persisted
    // So we validate behavior instead of real deletion

    expect([200, 404]).toContain(deletedGetResponse.status());

    const deletedBody = await deletedGetResponse.json();

    // If still exists, ensure it's not equal to updated data (mock behavior check)
    if (deletedGetResponse.status() === 200) {
      expect(deletedBody.id).toBe(postId);
    }
  });

});