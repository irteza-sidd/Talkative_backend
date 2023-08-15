const asyncHandler = require('express-async-handler');
const chatModel = require('../models/chatModel');
const userModel = require('../models/userModel');

const accesssChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("params not sent");
        return res.sendStatus(400);
    }

    var ischat = await chatModel.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: userId } } },
            { users: { $elemMatch: { $eq: req.user._id } } },
        ],
    }).populate("users", "-password")
        .populate("latestMessage");

    ischat = await userModel.populate(ischat, {
        path: 'latestMessage.sender',
        select: "name pic email",
    });

    if (ischat.length > 0) {
        res.send(ischat[0]);
    }
    else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await chatModel.create(chatData);
            const FullChat = await chatModel.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = asyncHandler(async (req, res) => {
    try {
        chatModel.find({ users: { $elemMatch: { $eq: req.user._id } } }).populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await userModel.populate(results, {
                    path: 'latestMessage.sender',
                    select: "name pic email",
                });
                res.status(200).send(results)
            });

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "please fill all fields" })
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send("More than 2 users required");
    }

    users.push(req.user);

    try {
        const groupchat = await chatModel.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await chatModel.findOne({ _id: groupchat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const renameGroup = asyncHandler(async (req, res) => {

    const { chatId, chatName } = req.body;

    const updatedChat = await chatModel.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new: true,
        }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("chat not found");
    }
    else {
        res.json(updatedChat);
    }
});

const addToGroup = asyncHandler(async (req, res) => {

    const { chatId, userId } = req.body;
    const added = await chatModel.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId},
        },
        {
            new: true,
        }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password");

        if(!added){
            res.status(404);
            throw new Error ("chat not found");
        }
        else{
            res.json(added);
        }
});

const removeFromGroup = asyncHandler(async (req, res) => {

    const { chatId, userId } = req.body;
    const removed = await chatModel.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId},
        },
        {
            new: true,
        }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password");

        if(!removed){
            res.status(404);
            throw new Error ("chat not found");
        }
        else{
            res.json(removed);
        }
});

module.exports = { addToGroup, accesssChat, fetchChats, createGroupChat, renameGroup,removeFromGroup};