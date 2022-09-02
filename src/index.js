const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users');

// const { Server } = require("socket.io");
require('dotenv').config();
const { generateMessage, generateLocation } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// const io = new Server(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
console.log(publicDirectoryPath);

app.use(express.static(publicDirectoryPath));

// app.get("/", (req, res) => {
//     res.send(index.html);
// });

// server (emit) => client (receive) - countUpdated
// client (emit) => server (receive) - increment
// let count = 0;


// socket.emit is emitting the event to a particular connection
// io.emit is emitting the event to every single connection currently available
// socket.broadcast.emit => when broadcasting event, send it to everybody except the current client 
// Every time Connection Starts => 
io.on("connection", (socket) => {   // built-in event of socket.io
    console.log(`New Web Socket Connection`);

    socket.on("join", (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit("message", generateMessage("Admin", "Welcome!"));    // server is emitting welcome message to client
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUserInRoom(user.room)
        });
        callback();
        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit => send message to all people in the specific room.
        // socket.broadcast.to.emit => send message to all people except the current client in the specific room.
    });

    socket.on("sendMessage", (message, callback) => {     // when submitted, server is listening a message from client
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed");
        }

        io.to(user.room).emit("message", generateMessage(user.username, message));    // server is emitting a message to client
        callback("Success");
    });

    socket.on("sendLocation", (pos, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("locationMessage", generateLocation(user.username, `https://www.google.com/maps/?q=${pos.lat},${pos.lon}`));
        callback("Location Shared");
    });

    socket.on("disconnect", () => { // built-in event of socket.io
        const removedUser = removeUser(socket.id);

        if (removedUser) {
            io.to(removedUser.room).emit("message", generateMessage("Admin", `${removedUser.username} has left!`));
            io.to(removedUser.room).emit("roomData", {
                room: removedUser.room,
                users: getUserInRoom(removedUser.room)
            });
        }
    });

    // socket.emit("countUpdated", count);
    // socket.on("increment", () => {
    //     count++;
    //     // socket.emit("countUpdated", count);  // socket.emit is emitting the event to a particular connection
    //     // io.emit("countUpdated", count); // io.emit is emitting the event to every single connection currently available
    // });
});

server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})