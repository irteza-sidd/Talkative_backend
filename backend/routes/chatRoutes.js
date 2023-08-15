const express=require('express')
const { accesssChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup} = require('../controllers/chatControllers')
const { protect } = require('../middleware/authMiddleware')

 const chatRouter=express.Router()

 chatRouter.post('/',protect,accesssChat)
chatRouter.get('/',protect,fetchChats)
chatRouter.post('/group',protect,createGroupChat);
chatRouter.put('/rename',protect,renameGroup); 
 chatRouter.put('/groupadd',protect,addToGroup);
chatRouter.put('/groupremove',protect,removeFromGroup);

 module.exports=chatRouter