import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['ADD', 'SELL', 'EDIT', 'DELETE'],
    },
    user: {
        type: String, // Username
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    qtyChange: {
        type: Number,
        required: true,
    },
    details: {
        type: String,
    },
    sellingPrice: { type: Number }, // Price sold at
    costPrice: { type: Number },    // Cost at time of sale
    profit: { type: Number }        // sellingPrice - costPrice
}, { timestamps: true });

export default mongoose.models.Log || mongoose.model('Log', LogSchema);
