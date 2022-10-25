const mongoose =require('mongoose')
const validator =require('validator')

const taskschema = new mongoose.Schema({
    description:{
        type:String,
        required: true,
        trim:true

    },title:{
        type:String,
        required: true,
        trim:true
    },importance:{
        type:String,
        default:'important',
        validate(value) {
            if (!(value==='very_important'|value==='important'|value==='good_to_do')) {
              throw new Error("not valid email");
            }
          },
        trim:true
    },
    completed:{

        type:Boolean,
        default:false
    },owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true,
    toJSON: {virtuals: true}
})
const Task=mongoose.model('Task',taskschema)




module.exports=Task
