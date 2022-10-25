const mongoose = require("mongoose");
const validator = require("validator");
const bcypt = require("bcryptjs");
const jwt=require('jsonwebtoken')
const Task = require('./tasks');


const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    tirm: true
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("age must be postive");
      }
    },
  },
  password: {
    type: String,
    trim: true,
    required: true,

    minlength: 6,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("contain password");
      }
    },
  },
  email: {
    type: String,
    trim: true,
    unique:true,
    required: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("not valid email");
      }
    },
  },
  avater: {
    type: Buffer
  },
  tokens: [{
      token:{
          type:String,
          required: true
      }
  }]
},{
  timestamps:true,
  toJSON: {virtuals: true}
  
});

userschema.virtual('tasks',{
  ref:'Task',
  localField:'_id',
  foreignField:'owner'

})

userschema.statics.findbycradenials=async(email,password)=>{
    const user=await User.findOne({email}) 
    if(!user){
        throw new Error('unable to login')
    }
    const ismatch=await bcypt.compare(password,user.password)
    if(!ismatch){
        throw new Error("unable to login")
    }
    return user
}

userschema.methods.toJSON=function(){
  const user = this
  const userobject=user.toObject()
  delete userobject.password
  delete userobject.tokens
  delete userobject.avater
  return userobject

}

userschema.methods.generateAuthToken=async function(){
    const user = this;
    const token=jwt.sign({_id:user._id.toString()},process.env.SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token

}

userschema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcypt.hash(user.password, 8);
  }
});

userschema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({owner:user._id})
});

const User = mongoose.model('User', userschema);

module.exports = User
