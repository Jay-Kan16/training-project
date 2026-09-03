// OpenAPI 3.0 specification for the Splitzy (expense-splitter) API.
// Served by swagger-ui-express at /api/docs (see server.js).
// Edit this file whenever routes/controllers change so the docs stay accurate.

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Splitzy API',
    version: '1.0.0',
    description:
      'Splitwise-style expense splitting API. Most endpoints require a JWT ' +
      'obtained from /auth/signup, /auth/login or /auth/google, sent as ' +
      '`Authorization: Bearer <token>`.',
  },
  servers: [{ url: '/api', description: 'Current server' }],
  tags: [
    { name: 'Auth', description: 'Signup, login and current-user endpoints' },
    { name: 'Users', description: 'User management (admin-restricted actions included)' },
    { name: 'Groups', description: 'Groups, members, balances and settlements' },
    { name: 'Expenses', description: 'Expenses belonging to a group' },
    { name: 'Notifications', description: 'In-app notifications' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          avatar: { type: 'string', nullable: true },
          balance: { type: 'number', example: 0 },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Group: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Goa Trip' },
          members: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          createdBy: { type: 'string' },
          expenses: {
            type: 'array',
            items: { $ref: '#/components/schemas/Expense' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ExpenseShare: {
        type: 'object',
        properties: {
          user: { type: 'string' },
          amount: { type: 'number', example: 250 },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          description: { type: 'string', example: 'Hotel booking' },
          amount: { type: 'number', example: 1000 },
          payer: { type: 'string', description: 'User ID who paid' },
          participants: {
            type: 'array',
            items: { type: 'string' },
          },
          group: { type: 'string' },
          splitType: {
            type: 'string',
            enum: ['equal', 'unequal', 'percentage'],
            example: 'equal',
          },
          shares: {
            type: 'array',
            items: { $ref: '#/components/schemas/ExpenseShare' },
          },
          date: { type: 'string', format: 'date-time' },
          createdBy: { type: 'string' },
        },
      },
      Settlement: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          group: { type: 'string' },
          from: { type: 'string' },
          to: { type: 'string' },
          amount: { type: 'number', example: 250 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          recipient: { type: 'string' },
          sender: { type: 'string' },
          type: {
            type: 'string',
            enum: ['settlement_reminder', 'settlement_received', 'expense_added', 'general'],
          },
          group: { type: 'string', nullable: true },
          amount: { type: 'number', nullable: true },
          message: { type: 'string' },
          read: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid JWT',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Authenticated but not allowed to perform this action',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      ValidationError: {
        description: 'Request body failed validation',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create a new account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', format: 'password', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Account created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', format: 'password', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Logged in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Log in / sign up with a Google ID token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['credential'],
                properties: {
                  credential: { type: 'string', description: 'Google ID token (JWT credential)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Logged in / account created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { description: 'Google token verification failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the currently authenticated user',
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users (admin only)',
        responses: {
          200: {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/users/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Users'],
        summary: 'Get a user by ID',
        responses: {
          200: {
            description: 'User',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update a user',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated user',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user (admin only)',
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/groups': {
      post: {
        tags: ['Groups'],
        summary: 'Create a group',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Goa Trip' },
                  members: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Additional member user IDs (creator is added automatically)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Group created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, group: { $ref: '#/components/schemas/Group' } } } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      get: {
        tags: ['Groups'],
        summary: "List the current user's groups",
        responses: {
          200: {
            description: 'List of groups',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, count: { type: 'integer' }, groups: { type: 'array', items: { $ref: '#/components/schemas/Group' } } } } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/groups/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Groups'],
        summary: 'Get a group by ID (member only)',
        responses: {
          200: { description: 'Group', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, group: { $ref: '#/components/schemas/Group' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Groups'],
        summary: 'Update a group (creator or admin only)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  members: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated group', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, group: { $ref: '#/components/schemas/Group' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Groups'],
        summary: 'Delete a group (creator or admin only)',
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/groups/{id}/members': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        tags: ['Groups'],
        summary: 'Add a member to a group by email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Member added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    group: { $ref: '#/components/schemas/Group' },
                    member: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { description: 'Group or user not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/groups/{id}/balances': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Groups'],
        summary: 'Get simplified balances / who-owes-whom for a group',
        responses: {
          200: { description: 'Balances', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } }, additionalProperties: true } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/groups/{id}/settle': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        tags: ['Groups'],
        summary: 'Record a settlement payment between two members',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from', 'to', 'amount'],
                properties: {
                  from: { type: 'string', description: 'Payer user ID' },
                  to: { type: 'string', description: 'Recipient user ID' },
                  amount: { type: 'number', example: 250 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Settlement recorded', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, settlement: { $ref: '#/components/schemas/Settlement' } } } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/expenses': {
      post: {
        tags: ['Expenses'],
        summary: 'Create an expense',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['description', 'amount', 'payer', 'participants', 'group'],
                properties: {
                  description: { type: 'string', example: 'Hotel booking' },
                  amount: { type: 'number', example: 1000 },
                  payer: { type: 'string', description: 'User ID who paid' },
                  participants: { type: 'array', items: { type: 'string' }, minItems: 1 },
                  group: { type: 'string', description: 'Group ID' },
                  splitType: { type: 'string', enum: ['equal', 'unequal', 'percentage'] },
                  shares: { type: 'array', items: { $ref: '#/components/schemas/ExpenseShare' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Expense created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, expense: { $ref: '#/components/schemas/Expense' } } } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      get: {
        tags: ['Expenses'],
        summary: 'List expenses',
        parameters: [
          { name: 'group', in: 'query', required: false, schema: { type: 'string' }, description: 'Filter by group ID' },
        ],
        responses: {
          200: { description: 'List of expenses', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, count: { type: 'integer' }, expenses: { type: 'array', items: { $ref: '#/components/schemas/Expense' } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/expenses/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Expenses'],
        summary: 'Get an expense by ID',
        responses: {
          200: { description: 'Expense', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, expense: { $ref: '#/components/schemas/Expense' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Expenses'],
        summary: 'Update an expense',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  amount: { type: 'number' },
                  splitType: { type: 'string', enum: ['equal', 'unequal', 'percentage'] },
                  shares: { type: 'array', items: { $ref: '#/components/schemas/ExpenseShare' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated expense', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, expense: { $ref: '#/components/schemas/Expense' } } } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Delete an expense',
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: "List the current user's notifications",
        responses: {
          200: { description: 'List of notifications', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/remind': {
      post: {
        tags: ['Notifications'],
        summary: 'Send a settlement reminder notification',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  recipient: { type: 'string', description: 'User ID to remind' },
                  group: { type: 'string', description: 'Group ID' },
                  amount: { type: 'number' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Reminder sent', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, notification: { $ref: '#/components/schemas/Notification' } } } } } },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/read-all': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        responses: {
          200: { description: 'Marked as read', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/{id}/read': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        tags: ['Notifications'],
        summary: 'Mark a single notification as read',
        responses: {
          200: { description: 'Marked as read', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, notification: { $ref: '#/components/schemas/Notification' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/notifications/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a notification',
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
};

module.exports = swaggerDocument;