let mongoose = require('mongoose')
let Schema = mongoose.Schema;
mongoose.connect('mongodb+srv://dbUser:HQXEnbpm7a8W@cluster0-orebi.mongodb.net/JobDetails?retryWrites=true&w=majority', 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })
    
let userSchema = new Schema({
    User: String,
    Password: String,
    Email: String
})

let account = mongoose.model("Accounts", userSchema)
module.exports.account = account;


