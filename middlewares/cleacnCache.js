const {clearHash} = require('../services/cache');

module.exports = async (req, res, next) => {
    await next();
    const {id: userId} = req.user;
    clearHash(userId);
};