const users = [];

// addUser, removeUser, getUser, getUserInRoom

let addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if (!username || !room) {
        return {
            error: "username and room are required",
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    // validate username
    if (existingUser) {
        return {
            error: "username is in use"
        }
    }

    const user = { id, username, room };
    users.push(user);
    return { user };
};

let removeUser = (id) => {
    let index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0]; // to get object from removed array return by splice
    }
};

let getUser = (id) => {
    return users.find((user) => user.id === id);
};

let getUserInRoom = (room) => {
    return users.filter((user) => user.room === room.trim().toLowerCase());
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
// addUser({  
//     id: 1,
//     username: "Ko Pyae",
//     room: "Central City"
// });

// addUser({
//     id: 2,
//     username: "Sana",
//     room: "Central City"
// });

// addUser({
//     id: 3,
//     username: "Minato",
//     room: "Star City"
// });

// console.log(users);

// let user = getUser(2);
// console.log(user);

// let userList = getUserInRoom("Central City");
// console.log(userList);
