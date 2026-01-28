import mongoose from 'mongoose';

const RepairSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Please provide customer name'],
    },
    contact: {
        type: String,
        required: [true, 'Please provide contact info'],
    },
    deviceDetails: {
        type: String,
        required: [true, 'Please provide device details'],
    },
    issueDescription: {
        type: String,
    },
    image: {
        type: String, // URL or base64
    },
    estimatedCost: {
        type: Number,
        default: 0,
    },
    partsSummary: {
        type: String, // Text description of parts used (stock/non-stock)
    },
    status: {
        type: String,
        enum: ['Received', 'In Progress', 'Waiting for Parts', 'Completed', 'Cancelled'],
        default: 'Received',
    },
    parts: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        price: { type: Number }, // Cost at time of usage
        qty: { type: Number, default: 1 }
    }],
    laborCost: {
        type: Number,
        default: 0,
    },
    totalCost: {
        type: Number,
        default: 0,
    },
    technician: {
        type: String, // Username
    }
}, { timestamps: true });

// Auto-calculate total before saving
RepairSchema.pre('save', function (next) {
    const partsTotal = this.parts.reduce((sum, part) => sum + (part.price * part.qty), 0);
    this.totalCost = partsTotal + this.laborCost;
    next();
});

export default mongoose.models.Repair || mongoose.model('Repair', RepairSchema);
