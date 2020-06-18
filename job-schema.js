let mongoose = require('mongoose')
let Schema = mongoose.Schema;

//Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://dbUser:HQXEnbpm7a8W@cluster0-orebi.mongodb.net/JobDetails?retryWrites=true&w=majority', 
    {   
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })

let jobSchema = new Schema({
    user: String,
    date: {type: String, default: Date.now},
    role: { name: String, company: String, location: String, wage: {type: String, default: 'See More Info' }, description: String},
    jobBoard: String,
    comment: String,
    url: String
})

let job = mongoose.model("job-data", jobSchema)
module.exports.job = job;


