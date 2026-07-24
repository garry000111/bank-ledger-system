const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require('../services/email.service')
const blackListModel = require('../models/blackList.model')

async function userRegisterController(req, res){
  const { email, password, name } = req.body

  const isExists = await userModel.findOne({
    email: email
  })

  if(isExists) {
    return res.status(422).json({
      message: "User already exists with email",
      status: "failed"
    })
  }

  const user = await userModel.create({
    email, password, name
  })

  const token = jwt.sign({
    userId: user._id
  }, process.env.JWT_SECRET, {
    expiresIn: "3d"
  })

  res.cookie("token", token)

  res.status(201).json({
    message: "user created successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name
    },
    token
  })

  await emailService.sendRegistrationEmail(user.email, user.name);

}


async function userLoginController(req, res) {
  const { email, password } = req.body

  const user = await userModel.findOne({
    email: email
  })
  .select("+password");//we have to write because in model in password we have written select: false
  //select: false means Mongoose will not fetch the password from the database unless you explicitly ask for it.

  if(!user) {
    return res.status(404).json({
      message: "User not found with this email"
    })
  }

  const isPasswordMatched = await user.comparePassword(password)

  if(!isPasswordMatched) {
    return res.status(401).json({
      message: "Password is incorrect"
    })
  }

  const token = jwt.sign({
    userId: user._id
  }, process.env.JWT_SECRET, {
    expiresIn: "3d"
  })

  res.cookie("token", token)

  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name
    },
    token
  })



}

async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorized?.split(" ")[1]

  if(!token){
    return res.status(400).json({
      message: "Logout successfull"
    })
  }

  res.cookie("token", "")

  await blackListModel.create({
    token: token
  })

  res.status(200).json({
    message: "User logged out successfully"
  })
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
}