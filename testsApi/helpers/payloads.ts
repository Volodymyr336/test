

export const newCommentPayload = {
    postId: 100,
    name: 'Test Name',
    email: 'test@example.com',
    body: 'This is a test comment.'
  };
  
  export const updatedCommentPayload = {
    postId: 999,
    id: 1,
    name: 'Updated Name',
    email: 'updated@example.com',
    body: 'Updated comment body.'
  };

  export const invalidCommentData = { postId: 1 };

  export const invalidUpdateData = {
    postId: 'invalid', 
    id: 1,
    name: '',
    email: 'not-an-email', 
    body: ''
  };

  // Payloads for Todos tests
export const newTodoPayload = {
    userId: 1,
    title: 'New Todo Title',
    completed: false
  };
  
  export const updatedTodoPayload = {
    userId: 1,
    title: 'Updated Todo Title',
    completed: true
  };
  
  export const invalidTodoData = {
    
  };
  
  export const invalidTodoUpdateData = {
    userId: 'invalid',  
    title: '',          
    completed: 'no'     
  };
  