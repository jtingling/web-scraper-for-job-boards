const {
    getPage,
    indeedScraper,
    workopolisScraper,
    jobBankScraper,
} = require('./data-service');

//scrapes data, saves to db
module.exports.scrapeData = async function (fields) {
    let webPage = await getPage(fields.address)
    let position;
    if (fields.hostName === 'indeed') {
        position = indeedScraper(webPage, fields)
    } else if (fields.hostName === 'workopolis') {
        position = workopolisScraper(webPage, fields)
    } else if (fields.hostName === 'jobbank') {
        position = jobBankScraper(webPage, fields)
    }
    return position
}
