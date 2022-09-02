const socket = io();

// server (emit) => client (receiver) --acknowledgement ---> server

// client (emit) => server (receiver) --acknowledgement ---> client

// Elements
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#messageText");
const sendButton = document.querySelector("#sendButton");
const messageDiv = document.querySelector("#message");

// mustache templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const urlMessageTemplate = document.querySelector("#url-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
let { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = messageDiv.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = messageDiv.offsetHeight;

    // Height of message container
    const containerHeight = messageDiv.scrollHeight;

    // How far have I scrolled?
    const scrollOffest = messageDiv.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight >= scrollOffest) {
        messageDiv.scrollTop = messageDiv.scrollHeight;
    }
};

socket.on("message", (messageObj) => { // client is listening welcome message from server
    // console.log(messageObj.text);
    const html = Mustache.render(messageTemplate, {
        username: messageObj.username,
        message: messageObj.text,
        timeStamp: moment(messageObj.createAt).format('h:mm A')
    });
    messageDiv.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    sendButton.setAttribute('disabled', 'disabled');
    let ipMessage = e.target.elements.messageText.value;
    socket.emit("sendMessage", ipMessage, (ack) => {
        sendButton.removeAttribute('disabled');
        messageInput.value = "";
        messageInput.focus();   // Set cursor in textbox
    });  // when submitted, client is emitting a message to server
});

socket.on("locationMessage", (urlObj) => {
    // console.log(urlObj);
    const html = Mustache.render(urlMessageTemplate, {
        username: urlObj.username,
        url: urlObj.url,
        timeStamp: moment(urlObj.createAt).format('h:mm A')
    });
    messageDiv.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
});

const sendLocationButton = document.querySelector("#send-location");
sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    };

    sendLocationButton.setAttribute('disabled', '');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }, (ack) => {
            console.log(ack);
            sendLocationButton.removeAttribute('disabled');
        });
    });
});

socket.emit("join", { username, room }, (err) => {
    if (err) {
        alert(err);
        location.href = '/';   // Go to join page
    }
});

// socket.on("countUpdated", (count) => {
//     console.log("Count is Updated to " + count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("Clicked");

//     socket.emit("increment");
// });