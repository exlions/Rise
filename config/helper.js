var crypto = require('crypto');

module.exports.genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') 
            .slice(0,length);  
}

module.exports.saltPassword = function(password, salt){
    var hash = crypto.createHmac('sha256', salt); 
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    }
}