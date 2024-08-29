import mongoose from "mongoose";

export const MobileNetworkSchema = new mongoose.Schema({
    network: {
        type: String
    },
    networkCode: {
        type: String,
        required: true
    },
})

const MobileNetworkModel =  mongoose.model('mobileNetwork', MobileNetworkSchema);
export default MobileNetworkModel