const { append } = require('express/lib/response')
const mongoose =require('mongoose')
const validator =require('validator')


mongoose.connect("mongodb+srv://yourtask:task123@cluster0.taf3j.mongodb.net/chat-app-api?retryWrites=true&w=majority",{
    useNewUrlParser:true

    
})
//mongodb+srv://yourtask:task123@cluster0.taf3j.mongodb.net/chat-app-api?retryWrites=true&w=majority
