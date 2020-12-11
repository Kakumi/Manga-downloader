const messages = require("../data/messages.json");
const InvalideMessageCodeException = require('../exceptions/invalideMessageCodeException');

module.exports.getMessage = (code) => {
    if (messages[code] != null) {
        return messages[code];
    }

    throw new InvalideMessageCodeException("Code message invalide ! (" + code + ")");
}