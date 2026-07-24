const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [ true, "Ledger must be associted with an account"],
    index: true,
    immutable: true
  },
  amount: {
    type: Number,
    required: true,
    immuttable: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: true,
    index: true,
    immutable: true
  },
  type: {
    type: String,
    enum: {
      values: [ "CREDIT", "DEBIT"],
      message: "Type can be either CREDIT or DEBIT",
    },
    required: true,
    immutable: true
  }
})

function preventLengendModification() {
  throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}

ledgerSchema.pre('findOneAndUpdate', preventLengendModification);
ledgerSchema.pre('UpdateOne', preventLengendModification);
ledgerSchema.pre('deleteOne', preventLengendModification);
ledgerSchema.pre('remove', preventLengendModification);
ledgerSchema.pre('deleteMany', preventLengendModification);
ledgerSchema.pre('findOneAndDelete', preventLengendModification);
ledgerSchema.pre('findOneAndReplace', preventLengendModification);



const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel