const socket = io();
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const welcomeTemplate = document.querySelector("#welcome-message-template").innerHTML;
const formInput = document.querySelector("#inputMessage");
const btnSubmit = document.querySelector("#btnSubmit");
const messages = document.querySelector("#messages");
const user = Qs.parse(location.search, { ignoreQueryPrefix: true });
const { username, room } = user;

socket.emit("join", user, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});

socket.on("message", (message) => {
    const html = Mustache.render(welcomeTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("hh:mm a"),
    });
    messages.insertAdjacentHTML("beforeend", html);
});

socket.on("textMessage", (message) => {
    if (message.text[1].length === 0) {
        return console.log("invalid input");
    }
    const html = Mustache.render(messageTemplate, {
        username: message.text[0],
        message: message.text[1],
        createdAt: moment(message.createdAt).format("hh:mm a"),
    });
    messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.url[0],
        url: message.url[1],
        createdAt: moment(message.createdAt).format("hh:mm a"),
    });
    messages.insertAdjacentHTML("beforeend", html);
});

//message-input
document.querySelector("#formMessage").addEventListener("submit", (e) => {
    e.preventDefault();
    btnSubmit.setAttribute("disabled", "disabled");
    const formMessage = formInput.value;

    socket.emit("formMessage", formMessage, (error) => {
        btnSubmit.removeAttribute("disabled");
        formInput.value = "";
        formInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log("message delivered");
    });
});

//location-share
const shareLocation = document.querySelector("#shareLocation");
shareLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return console.log("geolocation is not supported in your browser!");
    } else {
        shareLocation.setAttribute("disabled", "disabled");
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit(
                "sendLocation",
                {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                () => {
                    shareLocation.removeAttribute("disabled");
                    console.log("Location shared!");
                }
            );
        });
    }
});
