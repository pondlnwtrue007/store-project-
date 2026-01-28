import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
    },
    brand: {
        type: String,
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        default: 0,
    },
    type: {
        type: String,
        enum: ['product', 'spare_part'],
        default: 'product',
    },
    image: {
        type: String, // URL or base64
    },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
