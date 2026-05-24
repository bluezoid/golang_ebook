import { faker } from '@faker-js/faker';

// Non-disposable domains safe for testing
const SAFE_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me'];

export function buildValidCheckoutPayload() {
  const firstName = faker.person.firstName().replace(/[^a-zA-Z]/g, '').padEnd(2, 'a');
  const lastName = faker.person.lastName().replace(/[^a-zA-Z]/g, '').padEnd(2, 'a');
  const domain = faker.helpers.arrayElement(SAFE_DOMAINS);
  const email = `${faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '')}@${domain}`;
  // Valid Indian mobile: +91 followed by 10 digits starting with 6-9
  const phone = `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`;

  return { firstName, lastName, email, phone };
}

export function buildMongoOrder(overrides: Record<string, unknown> = {}) {
  return {
    _id: faker.database.mongodbObjectId(),
    orderId: `BLZ-${faker.string.alphanumeric(16).toUpperCase()}`,
    firstName: faker.person.firstName().replace(/[^a-zA-Z]/g, '').padEnd(2, 'a'),
    lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, '').padEnd(2, 'a'),
    email: `test@gmail.com`,
    phone: '+919876543210',
    product: 'deep-dive-into-go',
    amount: 149,
    status: 'pending',
    cashfreeOrderId: `CF-${faker.string.alphanumeric(10).toUpperCase()}`,
    createdAt: new Date(),
    ...overrides,
  };
}

export function buildCashfreeOrderResponse(overrides: Record<string, unknown> = {}) {
  return {
    order_id: `CF-${faker.string.alphanumeric(10).toUpperCase()}`,
    order_amount: 149,
    order_currency: 'INR',
    order_status: 'ACTIVE',
    payment_session_id: `session_${faker.string.alphanumeric(20)}`,
    cf_order_id: faker.number.int({ min: 100000, max: 9999999 }),
    ...overrides,
  };
}

export function buildCashfreeVerifyResponse(status = 'PAID', overrides: Record<string, unknown> = {}) {
  return {
    order_id: `CF-${faker.string.alphanumeric(10).toUpperCase()}`,
    order_status: status,
    cf_order_id: faker.number.int({ min: 100000, max: 9999999 }),
    order_amount: 149,
    order_currency: 'INR',
    ...overrides,
  };
}
