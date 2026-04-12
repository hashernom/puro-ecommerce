// Configuración global para pruebas Jest
require('dotenv').config({ path: '.env.test' });

// Mock de console para pruebas más limpias
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Configurar timeout global
jest.setTimeout(10000);

// Limpiar mocks después de cada test
afterEach(() => {
    jest.clearAllMocks();
});

// Variables globales para tests
global.testUser = {
    email: 'test@example.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'User'
};

global.testProduct = {
    name: 'Test Product',
    description: 'Test product description',
    price: 19.99,
    stock: 10,
    category: 'test'
};