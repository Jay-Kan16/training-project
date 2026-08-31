const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Group name is required'], trim: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
  },
  { timestamps: true }
);

groupSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Group', groupSchema);
