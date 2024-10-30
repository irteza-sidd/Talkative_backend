const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());

connectDB();

const PORT = process.env.PORT;

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.get('/',(req,res)=>{
    res.send('server is up');
})

const server = app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})

const io = require('socket.io')(server, {
    pingTimeout: 600000,
    cors: {
        origin: "https://talkative18.netlify.app",
    },
});


io.on("connection", (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id)
        socket.emit('connected')
    });

    socket.on('join chat', (room) => {
        socket.join(room)
        console.log('User Joined Room: ' + room);
    });

    socket.on('typing', (room) => socket.in(room).emit("typing"));
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));


    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived)
        });
    });
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
