const createApp = require('./app')
const request = require('supertest')
const validateUsername = require('./validation/validateUsername')
const validatePassword = require('./validation/validatePassword')

//Mock validateEmail to isolate tests
jest.mock('./validation/validateEmail', () => {
    return jest.fn((email) => {
        //Simulate real world simulation
        if (!email || typeof email !== 'string') return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return re.test(email);
    })
})

const validateEmail = require('./validation/validateEmail')
const app = createApp(validateUsername, validatePassword, validateEmail)

describe('given correct username and password', () => {
    test('return status 200', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.statusCode).toBe(200)
    })

    test('returns userId', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.body.userId).toBeDefined();
    })

    test('returns content type in JSON', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.headers['content-type']).toMatch(/json/)
    })

    test('returns success message', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.body.message).toBeDefined()
    })

    test('User ID as string', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(typeof response.body.userId).toBe('string')
    })
    // ...
})

describe('given incorrect or missing username and password', () => {

    test('return status 400', async () => {
        const response = await request(app).post('/users').send({
            username: 'user',
            password: 'password',
            email: 'not-an-email'
        })
        expect(response.statusCode).toBe(400)
    })

    test('Returns code 400 if username is missing', async () => {
        const response = await request(app).post('/users').send({
            username: '',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.statusCode).toBe(400)
    })

    test('Returns code 400 if password is missing', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: '',
            email: 'student@example.com'
        })
        expect(response.statusCode).toBe(400)
    })

    test('Return code 400 if the username doesnt meet the requirements', async () => {
        const response = await request(app).post('/users').send({
            username: 'usr',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.statusCode).toBe(400)
    })

    test('Return code 400 if the pw doesnt meet the requirements', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'pw',
            email: 'student@example.com'
        })
        expect(response.statusCode).toBe(400)
    })
    test('Return code 400 if the email doesnt meet the requirements', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'invalid-email'
        })
        expect(response.statusCode).toBe(400)
    })

    test('does not return userid on error', async () => {
        const response = await request(app).post('/user').send({
            username: 'usr',
            password: 'pw',
            email: 'invalid-email'
        })
        expect(response.body.userId).toBeUndefined()
    })
})