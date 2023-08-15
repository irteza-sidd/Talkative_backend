const express=require('express')
const { protect } = require('../middleware/authMiddleware')
const { sendMessage,allMessages } = require('../controllers/messageControllers')
const messageRouter=express.Router()

messageRouter.post('/',protect,sendMessage)
messageRouter.get('/:chatId',protect,allMessages)

module.exports=messageRouter