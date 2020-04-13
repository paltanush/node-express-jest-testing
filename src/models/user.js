const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email : {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlenght:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain password')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

//Generate Token 
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '1 days'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//Hash the plain text password before saving 
userSchema.pre('save', async function (next){
    const user = this
    if(user.isDirectModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

//Login - find by credentials
userSchema.statics.findByCredentials = async(email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User