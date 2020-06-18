const { job } = require('./job-schema.js');
const { account } = require('./user-schema')

//Get all data for the user.
module.exports.getAllJobs = async function (user) {
    let allJobs = await job.find({user:user}).exec()
    return allJobs.flat()
}

//Find user.
module.exports.authenticate = function (user, pass) {
    let credential = account.find({ User: user, Password: pass }, function (err, docs) { 
        if (err) {
            return err
        } 
    })
    .exec()
    
    return credential
}

//Find user.
authenticate = function (user) {
    let credential = account.find({ User: user}, function (err, docs) { 
        if (err) {
            return err
        } 
    })
    .exec()   
    return credential
}

module.exports.deleteJob = function(recordId) {
    return job.findOneAndDelete({_id: recordId})
}


//Find and create new account record if none exist.
module.exports.registerUser = async function (user, pass, email) {
    let acc = await authenticate(user)
    if (acc.length == 0) {
        let newAccount = new account({
            User: user,
            Password: pass,
            Email: email
        })
        return newAccount
    } else if (user == acc[0].User) {
        return "Username taken. Use a different username."
    } else {
        return "Something went wrong."
    }
}


