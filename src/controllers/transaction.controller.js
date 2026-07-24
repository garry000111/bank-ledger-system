const transactionModel = require('../models/transaction.model')
const accountModel = require('../models/account.model')
const ledgerModel = require('../models/ledger.model')
const emailService = require('../services/email.service')
const mongoose = require("mongoose")
const userModel = require("../models/user.model")

/*
 * - Create a new transaction
 * THE 10-STEP TRANSACTION FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
*/

async function createTransaction(req, res) {

  /**
   * 1. Validate request
   */
  

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body

  if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idempotencyKey are required"
    })
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  })

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })

  if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount"
    })
  }

  /**
   * 2. Validate idempotency key
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
  })

  if(isTransactionAlreadyExists) {
    if(isTransactionAlreadyExists.status === "COMPLETED"){
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists
      })
    }

    if(isTransactionAlreadyExists.status === "PENDING"){
      return res.status(200).json({
        message: "Transaction is still processing",
        transaction: isTransactionAlreadyExists
      })
    }

    if(isTransactionAlreadyExists.status === "FAILED"){
      return res.status(500).json({
        message: "Transaction processing failed, please retry"
      })
    }
    if(isTransactionAlreadyExists.status === "REVERSED"){
      return res.status(500).json({
        message: "Transaction was reversed, please retry"
      })
    }
  }

  /**
   * 3. Check account status
   */
  if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({
      message: "account is not active"
    })
  }

  /**
   * 4. Derive sender balance from ledger
  */
 
  const balance = await fromUserAccount.getBalance()

  if(balance < amount){
    res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
    })
  }

  /**
   * 5. Create transaction 
  */

  const session = await mongoose.startSession()
  session.startTransaction()

  const transaction = new transactionModel({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"
  })

  const debitLedgerEntry = await ledgerModel.create([{
    account: fromAccount,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT"
  }], {session})

  const creditLedgerEntry = await ledgerModel.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "CREDIT"
  }], {session})

  transaction.status = "COMPLETED"
  await transaction.save({ session })

  await session.commitTransaction()

  session.endSession()

  /**
   * 10. Send email transaction
  */

  // await emailService.sendTransactionNotification(req.user.email, req.user.name, amount, toAccount)

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction
  })



}

// async function createInitialFundTransaction(req, res) {
//   const { toAccount, amount, idempotencyKey } = req.body

//    const toUserAccount = await accountModel.findOne({
//     _id: toAccount
//    })

//    if(!toUserAccount) {
//     return res.status(400).json({
//       message: "Invalid toAccount"
//     })
//    }

//    const fromUserAccount = await accountModel.findOne({
//     systemUser: true,
//     user: req.user._id
//    })

//    if(!fromUserAccount) {
//     return res.status(400).json({
//       message: "System user account not found"
//     })
//    }

//    const session = await mongoose.startSession()
//    session.startTransaction()

//    const transaction = await transactionModel.create({
//     fromAccount: fromUserAccount._id,
//     toAccount,
//     amount,
//     idempotencyKey,
//     status: "PENDING"
//    }, { session })

//    const debitLedgerEntry = await ledgerModel.create({
//     account: fromUserAccount._id,
//     amount: amount,
//     transaction: transaction._id,
//     type: "DEBIT"
//    }, { session })

//    const creditLedgerEntry = await ledgerModel.create({
//     account: toUserAccount._id,
//     amount: amount,
//     transaction: transaction._id,
//     type: "CREDIT",
//    }, { session })

// }

async function createInitialFundTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required"
    });
  }

  // Find receiver account
  const toUserAccount = await accountModel.findById(toAccount);

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount"
    });
  }

  // Find SYSTEM user
  const systemUser = await userModel.findOne({
    systemUser: true
  });

  if (!systemUser) {
    return res.status(400).json({
      message: "System user not found"
    });
  }

  // Find SYSTEM account
  const fromUserAccount = await accountModel.findOne({
    user: systemUser._id      // change to userId if your schema uses userId
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found"
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING"
    });

    await transaction.save({ session });

    await ledgerModel.create(
      [{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
      }],
      { session }
    );

    await ledgerModel.create(
      [{
        account: toUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
      }],
      { session }
    );

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Initial funds transferred successfully",
      transaction
    });

  } catch (err) {

    await session.abortTransaction();

    return res.status(500).json({
      message: err.message
    });

  } finally {

    session.endSession();

  }
}

module.exports = {
  createTransaction,
  createInitialFundTransaction
}