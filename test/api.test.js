process.env.NODE_ENV = 'test';
// Runs against a real MongoDB (MONGODB_TEST_URI or local) using a throwaway database.
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecommerce-api-test';
process.env.JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || 'test-secret';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const db = require('../db');
const { userRepository } = require('../repositories');

const api = request(app);
let adminToken, userToken, userId, categoryId, productId, orderId;

const shipping = { street: '1 Moi Ave', city: 'Nairobi', zip: '00100', country: 'Kenya' };

async function register(email) {
    const res = await api.post('/api/v1/users/register')
        .send({ name: 'Test', email, password: 'password123', phone: '0700000000', isAdmin: true });
    return res;
}

before(async () => {
    await db.connect();
    await mongoose.connection.dropDatabase();
    await mongoose.model('User').init();

    await register('admin@test.com');
    await userRepository.setAdminByEmail('admin@test.com');
    const login = await api.post('/api/v1/users/login').send({ email: 'admin@test.com', password: 'password123' });
    adminToken = login.body.token;
});

after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

test('register ignores isAdmin and hides password hash', async () => {
    const res = await register('User@Test.com');
    assert.equal(res.status, 201);
    assert.equal(res.body.user.isAdmin, false);
    assert.equal(res.body.user.email, 'user@test.com');
    assert.equal(res.body.user.passwordHash, undefined);
    userToken = res.body.token;
    userId = res.body.user._id;
});

test('duplicate email is rejected', async () => {
    const res = await register('user@test.com');
    assert.equal(res.status, 409);
});

test('login rejects wrong password and unknown email the same way', async () => {
    const wrong = await api.post('/api/v1/users/login').send({ email: 'user@test.com', password: 'nope' });
    const unknown = await api.post('/api/v1/users/login').send({ email: 'ghost@test.com', password: 'nope' });
    assert.equal(wrong.status, 400);
    assert.equal(unknown.status, 400);
    assert.deepEqual(wrong.body, unknown.body);
});

test('user list requires admin and never leaks hashes', async () => {
    assert.equal((await api.get('/api/v1/users')).status, 401);
    assert.equal((await api.get('/api/v1/users').set('Authorization', `Bearer ${userToken}`)).status, 403);
    const res = await api.get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.every((u) => u.passwordHash === undefined));
});

test('users can only read their own profile', async () => {
    const me = await api.get(`/api/v1/users/${userId}`).set('Authorization', `Bearer ${userToken}`);
    assert.equal(me.status, 200);
    const admins = await userRepository.findByEmailWithPassword('admin@test.com');
    const other = await api.get(`/api/v1/users/${admins._id}`).set('Authorization', `Bearer ${userToken}`);
    assert.equal(other.status, 403);
});

test('only admins can create categories', async () => {
    const body = { name: 'Phones', icon: 'phone', color: '#000' };
    assert.equal((await api.post('/api/v1/categories').set('Authorization', `Bearer ${userToken}`).send(body)).status, 403);
    const res = await api.post('/api/v1/categories').set('Authorization', `Bearer ${adminToken}`).send(body);
    assert.equal(res.status, 201);
    categoryId = res.body._id;
});

test('category update edits in place', async () => {
    const res = await api.put(`/api/v1/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`).send({ name: 'Smartphones' });
    assert.equal(res.status, 200);
    assert.equal(res.body._id, categoryId);
    assert.equal((await api.get('/api/v1/categories')).body.length, 1);
});

test('product CRUD', async () => {
    const bad = await api.post('/api/v1/products').set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X1', description: 'd', category: new mongoose.Types.ObjectId().toString(), countInStock: 1 });
    assert.equal(bad.status, 400);

    const res = await api.post('/api/v1/products').set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Phone X', description: 'A phone', price: 199.99, category: categoryId, countInStock: 5 });
    assert.equal(res.status, 201);
    productId = res.body._id;

    const one = await api.get(`/api/v1/products/${productId}`);
    assert.equal(one.body.category.name, 'Smartphones');

    const list = await api.get(`/api/v1/products?category=${categoryId}`);
    assert.equal(list.body.total, 1);

    const upd = await api.put(`/api/v1/products/${productId}`).set('Authorization', `Bearer ${adminToken}`).send({ price: 150 });
    assert.equal(upd.body.price, 150);
});

test('malformed and missing ids both return 404', async () => {
    assert.equal((await api.get('/api/v1/products/not-an-id')).status, 404);
    assert.equal((await api.get(`/api/v1/products/${new mongoose.Types.ObjectId()}`)).status, 404);
});

test('category with products cannot be deleted', async () => {
    const res = await api.delete(`/api/v1/categories/${categoryId}`).set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 409);
});

test('placing an order prices from the DB and reserves stock', async () => {
    const res = await api.post('/api/v1/orders').set('Authorization', `Bearer ${userToken}`)
        .send({ orderItems: [{ product: productId, quantity: 2, price: 0.01 }], shippingAddress: shipping, phone: '0700000000' });
    assert.equal(res.status, 201);
    assert.equal(res.body.totalPrice, 300);
    orderId = res.body._id;
    assert.equal((await api.get(`/api/v1/products/${productId}`)).body.countInStock, 3);
});

test('ordering more than in stock fails without touching stock', async () => {
    const res = await api.post('/api/v1/orders').set('Authorization', `Bearer ${userToken}`)
        .send({ orderItems: [{ product: productId, quantity: 4 }], shippingAddress: shipping, phone: '0700000000' });
    assert.equal(res.status, 409);
    assert.equal((await api.get(`/api/v1/products/${productId}`)).body.countInStock, 3);
});

test('users see their own orders, admins see all', async () => {
    const mine = await api.get('/api/v1/orders/mine').set('Authorization', `Bearer ${userToken}`);
    assert.equal(mine.body.length, 1);
    assert.equal((await api.get('/api/v1/orders').set('Authorization', `Bearer ${userToken}`)).status, 403);
    assert.equal((await api.get('/api/v1/orders').set('Authorization', `Bearer ${adminToken}`)).body.length, 1);
    assert.equal((await api.get(`/api/v1/orders/${orderId}`).set('Authorization', `Bearer ${adminToken}`)).status, 200);
});

test('cancelling an order restocks once', async () => {
    const cancel = () => api.put(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`).send({ status: 'cancelled' });
    assert.equal((await cancel()).status, 200);
    assert.equal((await cancel()).status, 409);
    assert.equal((await api.get(`/api/v1/products/${productId}`)).body.countInStock, 5);
});

test('login response never includes the password hash', async () => {
    const res = await api.post('/api/v1/users/login').send({ email: 'user@test.com', password: 'password123' });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.passwordHash, undefined);
    const me = await api.get('/api/v1/users/me').set('Authorization', `Bearer ${res.body.token}`);
    assert.equal(me.body.email, 'user@test.com');
    assert.equal(me.body.passwordHash, undefined);
});

test('unknown routes and bad tokens', async () => {
    assert.equal((await api.get('/api/v1/nope')).status, 404);
    assert.equal((await api.get('/api/v1/users/me').set('Authorization', 'Bearer garbage')).status, 401);
});
