const bodyparser = require('body-parser');
const path = require('path');
const express = require('express');
const { parseAsync } = require('json2csv');
const { scrapeData } = require('./scraper-service.js')
const { getAllJobs, authenticate, registerUser, deleteJob } = require('./retrieve-data')
const { saveJobs } = require('./parseJobData')
const fs = require('fs')
const clientSessions = require('client-sessions')
const app = express();

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(express.static(__dirname + '/'));
app.use(clientSessions({
    cookieName: 'mySession',
    secret: 'svMQpynWmHh5wS6k',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5
}))

const hostname = '127.0.0.1';
const port = process.env.PORT || 8080;

//If no cookie data exists for user, redirect to login page
app.get('/welcome', (req, res) => {
    console.log(req.mySession.user + " has logged out.")
    req.mySession = {};
    res.sendFile(path.join(__dirname + "/views/login.html"))

})

//User logging in
app.post('/login', (req, res) => {
    let user = req.body.user
    let pw = req.body.pw
    authenticate(user, pw).then((q) => { //queries account DB, returns promise

        if (q[0] == undefined) {
            res.send("Invalid login. Try again.")
        } else {
            req.mySession.user = q[0].User
            console.log(q[0].User + " has logged in.")
            res.redirect('/')
        }
    });
})
//User registering an account
app.post('/register', (req, res) => {
    let user = req.body.user
    let pass = req.body.pw
    let em = req.body.em
    let confirmPass = req.body.cpw
    if (pass === confirmPass) {
        registerUser(user, pass, em)
            .then((cred) => {
                if (typeof cred == Object) {
                    cred.save().then(res.redirect('/welcome'));
                }
            }).catch(res.redirect('/register'))
    } else {
        res.redirect('/register')
    }
})

//deletes a single record from the db. Updates table on front end
app.delete('/removeOne', (req, res) => {
    let currentUser = req.mySession.user;
    let recordId = req.body[0].id;
    console.log(currentUser + " deleted job: " + recordId)
    if (currentUser) {
        deleteJob(recordId)
            .then((_) => { return getAllJobs(currentUser) })
            .then((json) => { return saveJobs(currentUser, json) })
            .then((_) => res.sendFile(path.join(__dirname + "/views/main.html")))
            .catch((err) => console.log(err))
    } else {
        res.redirect('/welcome')
    }
})

//redirect to main page after authenticated
app.get('/', (req, res) => {
    if (req.mySession.user) {
        res.sendFile(path.join(__dirname + "/views/main.html"))
    } else {
        res.redirect('/welcome')
    }

})

//user Registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/register.html"))
})

//main page to submit job URLs
app.post('/upload', (req, res) => {
    let url = req.body.ws;
    let comment = req.body.comments
    let currentUser = req.mySession.user
    let fileJSON = `./resources/json-data/${currentUser}.json`
    let link = url.match(/workopolis|indeed|jobbank/)
    let jobBoard = link[0]
    let fields = { 
        user: currentUser, 
        address: url, 
        jobComment: comment, 
        hostName: jobBoard 
    }
    if (link == null) {
        res.send('Invalid data, press back to try again.')
    } else {
        scrapeData(fields)
            .then((positionDocument) => { return positionDocument.save() })
            .then((_) => {
                res.redirect('/')
            })
    }
})

//Gets all job data from DB
app.get('/getAllJobs', (req, res) => {
    const currentUser = req.mySession.user;
    getAllJobs(currentUser).then((q) => res.json(q))
})

//TODO: fix json2CSV download implementation
app.get('/getCSV', (req, res) => {
    const currentUser = req.mySession.user;
    const fileJSON = `${__dirname}/resources/json-data/${currentUser}.json`
    const fileCSV = `${__dirname}/resources/${currentUser}-csv.json`
    const fields = ["Date", "Position", "Company", "Location", "JobBoard", "Comment", "Url"]
    const opts = { fields };
    let csvData;

    fs.readFile(fileJSON, 'utf8', (err, jsonData) => {
        if (err) throw err;
        parseAsync(jsonData, opts).then((csv) => {
            fs.writeFile(`./resources/${currentUser}-csv.txt`, csv, (err) => {
                if (err) throw err;
            })    
        }).then((_) => {
            res.download(fileCSV, 'myFile.csv', (err) => {
                if (err)
                    res.send(err)
            })
        })
    })
})




//Downloads file from server storage
app.get('/download', (req, res) => {
    let currentUser = req.mySession.user;
    const file = `${__dirname}/resources/${currentUser}-csv.txt`
    if (currentUser) {
        getAllJobs(currentUser)
            .then((allJobs) => { return saveJobs(currentUser, allJobs) })
        res.download(file, (err) => {
            if (err) {
                console.log(err)
                res.send("No jobs exist for user " + currentUser)
            }
        })
    } else {
        res.redirect('./login')
    }
})

app.get('/session', (req, res) => {
    if (req.mySession.user) {
        res.json(req.mySession.user)
    } else {
        res.redirect('/')
    }
})

app.get('/howTo', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/getting-started.html"))
})

app.listen(port, hostname, () => {
    console.log(`Server running on port ${port}`)
})
