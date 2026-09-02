/**
 * OpenAPI 3.0 Specification for Splitzy Backend API
 */

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Splitzy API',
    version: '1.0.0',
    description:
      'RESTful API for Splitzy — modern group expense splitting and settlement management with Google OAuth and instant reminder notifications.',
    contact: {
      name: 'Splitzy Support',
      email: 'support@splitzy.app',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & Profile endpoints' },
    { name: 'Users', description: 'User lookup and search' },
    { name: 'Groups', description: 'Group creation, members, balances, and settlements' },
    { name: 'Expenses', description: 'Expense tracking and split calculations' },
    { name: 'Notifications', description: 'In-app reminder notifications' },
    { name: 'Health', description: 'Server health check' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from `/api/auth/login` or `/api/auth/signup`',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
          name: { type: 'string', example: 'Alice Johnson' },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          avatar: { type: 'string', example: 'https://lh3.googleusercontent.com/a/...' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      Group: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66d3a1b2c4e5f67890123457' },
          name: { type: 'string', example: 'Goa Trip 🏖️' },
          creator: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
          members: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SplitShare: {
        type: 'object',
        properties: {
          user: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
          amount: { type: 'number', example: 250.0 },
          percentage: { type: 'number', example: 50 },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66d3a1b2c4e5f67890123458' },
          description: { type: 'string', example: 'Dinner at Beach Shack' },
          amount: { type: 'number', example: 500.0 },
          payer: { $ref: '#/components/schemas/User' },
          group: { type: 'string', example: '66d3a1b2c4e5f67890123457' },
          splitType: { type: 'string', enum: ['equal', 'unequal', 'percentage'], example: 'equal' },
          splits: {
            type: 'array',
            items: { $ref: '#/components/schemas/SplitShare' },
          },
          date: { type: 'string', format: 'date-time' },
        },
      },
      SettlementSuggestion: {
        type: 'object',
        properties: {
          from: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
          to: { type: 'string', example: '66d3a1b2c4e5f67890123459' },
          fromName: { type: 'string', example: 'Bob' },
          toName: { type: 'string', example: 'Alice' },
          amount: { type: 'number', example: 250.0 },
        },
      },
      GroupBalances: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          balances: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
                name: { type: 'string', example: 'Alice' },
                email: { type: 'string', example: 'alice@example.com' },
                balance: { type: 'number', example: 250.0 },
              },
            },
          },
          settlements: {
            type: 'array',
            items: { $ref: '#/components/schemas/SettlementSuggestion' },
          },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66d3a1b2c4e5f67890123460' },
          recipient: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
          sender: { $ref: '#/components/schemas/User' },
          type: { type: 'string', enum: ['settlement_reminder', 'expense_added', 'group_invite'], example: 'settlement_reminder' },
          group: { type: 'string', example: '66d3a1b2c4e5f67890123457' },
          amount: { type: 'number', example: 250.0 },
          message: { type: 'string', example: 'Alice sent you a reminder to settle ₹250 in Goa Trip' },
          read: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Invalid credentials or resource not found' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns server status and uptime.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    uptime: { type: 'number', example: 124.5 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account with name, email, and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alice Johnson' },
                  email: { type: 'string', format: 'email', example: 'alice@example.com' },
                  password: { type: 'string', format: 'password', minLength: 6, example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: {
            description: 'Validation error or User already exists',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in user',
        description: 'Authenticates with email and password to receive a JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alice@example.com' },
                  password: { type: 'string', format: 'password', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          401: {
            description: 'Invalid email or password',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in with Google OAuth',
        description: 'Verifies Google ID credential and returns JWT authentication token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Google authentication successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: {
            description: 'Invalid Google token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid or missing token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Search users',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'search',
            in: 'query',
            description: 'Search by name or email',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'List of matching users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/groups': {
      get: {
        tags: ['Groups'],
        summary: 'Get groups for current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of user groups',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    groups: { type: 'array', items: { $ref: '#/components/schemas/Group' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Groups'],
        summary: 'Create a new expense group',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Goa Trip 🏖️' },
                  members: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['66d3a1b2c4e5f67890123459'],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Group created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    group: { $ref: '#/components/schemas/Group' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/groups/{id}': {
      get: {
        tags: ['Groups'],
        summary: 'Get group details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Group details with members',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    group: { $ref: '#/components/schemas/Group' },
                  },
                },
              },
            },
          },
          404: { description: 'Group not found' },
        },
      },
    },
    '/api/groups/{id}/members': {
      post: {
        tags: ['Groups'],
        summary: 'Add a member to group by email',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'bob@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Member added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Member added successfully' },
                    group: { $ref: '#/components/schemas/Group' },
                  },
                },
              },
            },
          },
          400: { description: 'User not found or already in group' },
        },
      },
    },
    '/api/groups/{id}/balances': {
      get: {
        tags: ['Groups'],
        summary: 'Calculate simplified balances and suggested settlements',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Net member balances and minimum transactions to settle',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupBalances' },
              },
            },
          },
        },
      },
    },
    '/api/groups/{id}/settle': {
      post: {
        tags: ['Groups'],
        summary: 'Record a settlement between members',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['from', 'to', 'amount'],
                properties: {
                  from: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
                  to: { type: 'string', example: '66d3a1b2c4e5f67890123459' },
                  amount: { type: 'number', example: 250.0 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Settlement recorded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Settlement recorded successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'List expenses',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'group', in: 'query', schema: { type: 'string' }, description: 'Filter by Group ID' },
          { name: 'payer', in: 'query', schema: { type: 'string' }, description: 'Filter by Payer ID' },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: {
            description: 'List of expenses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'number', example: 4 },
                    expenses: { type: 'array', items: { $ref: '#/components/schemas/Expense' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'Create a new shared expense',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['description', 'amount', 'payer', 'participants', 'group', 'splitType'],
                properties: {
                  description: { type: 'string', example: 'Dinner at Beach Shack' },
                  amount: { type: 'number', example: 500.0 },
                  payer: { type: 'string', example: '66d3a1b2c4e5f67890123456' },
                  group: { type: 'string', example: '66d3a1b2c4e5f67890123457' },
                  participants: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['66d3a1b2c4e5f67890123456', '66d3a1b2c4e5f67890123459'],
                  },
                  splitType: { type: 'string', enum: ['equal', 'unequal', 'percentage'], example: 'equal' },
                  rawShares: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SplitShare' },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Expense created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    expense: { $ref: '#/components/schemas/Expense' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/expenses/{id}': {
      get: {
        tags: ['Expenses'],
        summary: 'Get expense details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Expense details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    expense: { $ref: '#/components/schemas/Expense' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Delete an expense',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Expense deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Expense deleted successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications for logged in user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User notifications with unread count',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'number', example: 3 },
                    unreadCount: { type: 'number', example: 1 },
                    notifications: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications/remind': {
      post: {
        tags: ['Notifications'],
        summary: 'Send settlement reminder notification',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipientId', 'groupId', 'amount'],
                properties: {
                  recipientId: { type: 'string', example: '66d3a1b2c4e5f67890123459' },
                  groupId: { type: 'string', example: '66d3a1b2c4e5f67890123457' },
                  amount: { type: 'number', example: 250.0 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Reminder notification sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    notification: { $ref: '#/components/schemas/Notification' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Notification marked as read',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    notification: { $ref: '#/components/schemas/Notification' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications/read-all': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All notifications marked as read',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'All notifications marked as read' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete notification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Notification deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Notification removed' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;

