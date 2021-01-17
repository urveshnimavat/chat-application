exports.generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime(),
    };
};

exports.generateLocation = (url) => {
    return {
        url,
        createdAt: new Date().getTime(),
    };
};
