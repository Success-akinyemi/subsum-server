import mongoose from "mongoose";

export const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        unique: true,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        expires: 3600 //1Hour
    }
})

const TokenModel =  mongoose.model('userToken', TokenSchema);
export default TokenModel