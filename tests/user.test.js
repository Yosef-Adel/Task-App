const request=require("supertest")
const User = require('../src/models/users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app=require('../src/app')

const userOneid=new mongoose.Types.ObjectId()
userOne={
    _id:userOneid,
        name:"ali",
         age:15,
        email:"ali@gmail.com",
        password:"a12345",
        tokens:[{
            token:jwt.sign({_id:userOneid},process.env.SECRET)
        }]
}
beforeEach(async()=>{

    await User.deleteMany()
    await User.create(userOne)
})
test('should create user',async () => { 
    const response =await request(app).post('/users').send({
        name:"ali",
        age:15,
       email:"ali23@gmail.com",
       password:"a12345",
    }).expect(200)
    const user=await User.findById(response.body.user._id)
    expect(user).not.toBeNull
    expect(response.body).toMatchObject({
        user:{
         name:"ali",
        email:"ali23@gmail.com"},
        token:user.tokens[0].token
    })
 })
 test('should not create user',async () => { 
    await request(app).post('/users').send({
        name:"ali",
        age:15,
       email:"ali@gmail.com",
       password:"a12345",
    }).expect(400)
 })

 test('should login user',async () => { 
    await request(app).post('/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)
 })
 test('should not login user',async () => { 
    await request(app).post('/login').send({
        email:"ali@gmail.com",
        password:"a123458"
    }).expect(400)
 })

 test('should logout user',async () => { 
    await request(app).post('/logout')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
 })
 test('should not logout user',async () => { 
    await request(app).post('/logout')
    
    .send()
    .expect(401)
 })
 test('should delete user',async () => { 
    await request(app).delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
 })
 test('should not delete user',async () => { 
    await request(app).delete('/users/me')
    .send()
    .expect(401)
 })