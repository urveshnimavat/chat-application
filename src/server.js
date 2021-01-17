const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("../utils/message");
const {
    addUser,
    removeUser,
    getUser,
    getUserInRoom,
} = require("../utils/room");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

const port = process.env.PORT || 3000;

//establish socket connection
io.on("connection", (socket) => {
    console.log("new socket web connection..");

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit("message", generateMessage(`Welcome ${user.username}!`));
        socket
            .to(user.room)
            .emit("message", generateMessage(`${user.username} connected!`));

        callback();
    });

    //when user left
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage(`${user.username} has left!!!`)
            );
        }
    });

    //text-message
    socket.on("formMessage", (formMessage, callback) => {
        const filter = new Filter();
        if (filter.isProfane(formMessage)) {
            return callback("Profanity is not allowed");
        }

        const user = getUser(socket.id);
        io.to(user.room).emit(
            "textMessage",
            generateMessage([`${user.username}`, formMessage])
        );
        callback();
    });

    //location-message
    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit(
            "locationMessage",
            generateLocation([
                `${user.username}`,
                `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
            ])
        );
        callback();
    });
});

server.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
