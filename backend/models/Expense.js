const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: [true, 'Description is required'], trim: true },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than 0'] },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    splitType: { type: String, enum: ['equal', 'unequal', 'percentage'], default: 'equal' },
    shares: [shareSchema],
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ group: 1, date: -1 });
expenseSchema.index({ payer: 1 });
expenseSchema.index({ participants: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
