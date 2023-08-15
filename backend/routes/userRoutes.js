const express = require('express')
const { registerUser, authUser, allUsers } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')



const userRouter = express.Router()

userRouter.post('/', registerUser)

userRouter.post('/login', authUser)

userRouter.get('/', protect, allUsers);


module.exports = userRouter