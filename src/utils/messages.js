let generateMessage = (username, text) => {
    return {
        username,
        text,
        createAt: new Date().getTime()
    }
};

let generateLocation = (username, url) => {
    return {
        username,
        url,
        createAt: new Date().getTime()
    }
};

module.exports = {
    generateMessage,
    generateLocation
};