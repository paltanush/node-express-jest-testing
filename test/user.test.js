const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name:"Tanush",
    email: 'Tanush@test.com',
    password:'1234567890',
    tokens:[{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach( async () => {
    await User.deleteMany()
    const user = new User(userOne)
    await user.save()
})

test('Should signup a new user', async () => {
    const response = await request(app).post('/user/signup').send({
        name: 'Dhriti',
        email:"Dhriti@test.com",
        password:"1234567890"
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(response.body).toMatchObject({
        user:{
            name: 'Dhriti',
        email:"dhriti@test.com"
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('1234567890')
}) 

test('should login existing user', async () => {
    const response = await request(app)
    .post('/user/login')
    .send({
        email:userOne.email,
        password: userOne.password
    })
    .expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token)
    .toBe(user.tokens[1].token)
})

test('should not login nonexistent user', async () => {
    await request(app).post('/user/login')
    .send({
        email: userOne.email,
        password: 'wrongpassword'
    })
    .expect(400)
})

test('should logout already login user', async () => {
    await request(app)
    .post('/user/logout')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})


test('should update valid user fields', async () => {
    await request(app)
    .patch('/user/updateProfile')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Dhriti Pal'
    })
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Dhriti Pal')    
})

test('should not update invalid user fields', async () => {
    await request(app)
    .patch('/user/updateProfile')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'India'
    })
    .expect(400)
})
