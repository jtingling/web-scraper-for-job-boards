const { parseAsync } = require('json2csv');
const fs = require('fs')

//Data = returned query from DB,
//CurrentUser = user as a string from registration
//Writes retrived data to server storage in .CSV format (JSON2CSV)
module.exports.saveJobs = async function (currentUser, data) {
    const fields = ["Date", "Position", "Company", "Location", "JobBoard", "Comment", "Url"]
    const opts = { fields };
    //JSON2CSV function
    let csvData = await parseAsync(data, opts)
    fs.writeFile(`./resources/${currentUser}.txt`, csvData, (err) => {
        if (err) throw err;
        console.log(currentUser + ' modified a job.')
    })
}

