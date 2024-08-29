import mongoose from "mongoose";
import crypto from 'crypto'
import bcryptjs from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'


export const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
    },
    password: {
        type: String,
        required: [true, "Please provide a password"]
    },
    pin: {
        type: String
    },
    email: {
        type: String,
        required: [true, "please Provide a valid email"],
        unique: [true, "Email already exist"]
    },
    firstName: { type: String },
    lastName: { type: String },
    mobile: { 
        type: String,
    },
    profile: { 
        type: String,
        default: 'https://firebasestorage.googleapis.com/v0/b/success-clone.appspot.com/o/user_1177568.png?alt=media&token=3c4010b0-526b-4f76-ae30-d0e74d76716e'
    },
    acctBalance: {
        type: Number, 
        default: 0,
    },
    transactionTotal: {
        type: Number,
        default: 0,
    },
    refCode: {
        type: String
    },
    referralLink: {
        type: String
    },
    referrals: {
        type: Array
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    verified: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
{minimize: false},
{timestamps: true}
);

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')) {
        return next();
    };
  
    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.matchPasswords = async function(password){
    return await bcryptjs.compare(password, this.password)
}

UserSchema.pre('save', async function(next){
    if(!this.isModified('pin')) {
        return next();
    };
  
    try {
        const salt = await bcryptjs.genSalt(10);
        this.pin = await bcryptjs.hash(this.pin, salt)
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.matchPin = async function(pin){
    return await bcryptjs.compare(pin, this.pin)
}

UserSchema.methods.getSignedToken = function(){
    return jsonwebtoken.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE})
}

UserSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)

    return resetToken
}


const UserModel =  mongoose.model('user', UserSchema);
export default UserModel