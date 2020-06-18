const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { job } = require('./job-schema')

//Grabs content from url from headless chromium browser
const getPage = async function (url) {
    let html;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    page.once('load', () => { console.log('Page loaded')})
    html = await page.content();
    await browser.close();
    return html;
}

//System date, YYYY/MM/DD
const currentDate = function () {
    const now = new Date()
    let todayDate = '';
    todayDate += now.getFullYear() + '/'
    todayDate += (now.getMonth() + 1) + '/'
    todayDate += now.getDate()

    return todayDate
}

function createNewJob(fields, role) {
    return new job({
        user: fields.user,
        date: currentDate(),
        role: {
            name: role.name,
            company: role.company,
            location: role.location,
            wage: role.wage,
            description: role.description
        },
        jobBoard: fields.hostName,
        comment: fields.jobComment,
        url: fields.address
    })
}

/*
-------------------------------------------------------------
Scrapers [Indeed, Workopolis, jobBank] -- Highly coupled
--------

Each html page has a different layout, therefore each method
selects different tags based on where the data is coming from.

fields parameter is passed through to createNewJob function
--------------------------------------------------------------
*/

const indeedScraper = function (indeedHtmlPage, fields) {

    let $ = cheerio.load(indeedHtmlPage);
    let posTitle = $('h3').text();
    let companyName = $("h4").text();
    let jobDescription = $('#jobDescriptionText')
    let header = $('div.jobsearch-JobMetadataHeader icl-u-xs-mb--md').text()
    let pay = $('span.jobsearch-JobMetadataHeader-iconLabel').last().text();
    console.log(pay)
    let loc = $('div.jobsearch-JobMetadataHeader-itemWithIcon.icl-u-textColor--secondary.icl-u-xs-mt--xs').first().text();
    console.log(loc)
    let dollarSignIdx = pay.indexOf('$');

    pay = pay.substring(dollarSignIdx)

    if ($("h4").text().length == 0) {
        companyName = $("div.icl-u-lg-mr--sm.icl-u-xs-mr--xs").text();
    }

    let roleFields = {
        name: posTitle,
        company: companyName,
        description: jobDescription,
        wage: pay,
        location: loc
    }

    return createNewJob(fields, roleFields)
}

const workopolisScraper = function (workopolisHtmlPage, fields) {
    let $ = cheerio.load(workopolisHtmlPage);

    let posTitle = $('.ViewJobHeader-title').text();
    let jobDescription = $('div.viewjob-description.ViewJob-description')
    let companyName = $(".ViewJobHeader-company").text();
    let loc = $("span.ViewJobHeader-property").text();

    let roleFields = {
        name: posTitle,
        company: companyName,
        description: jobDescription,
        wage: "temp",
        location: loc
    }

    return createNewJob(fields, roleFields)

}

const jobBankScraper = function (jobBankHtmlPage, fields) {
    let $ = cheerio.load(jobBankHtmlPage);

    let posTitle = $("span[property='title']").text().trim();
    let companyName = $("a.external").text();
    let jobDescription = $('div.job-posting-detail-requirements')
    let pay = $('span.attribute-value').text()
    console.log(pay)
    if (companyName.length == 0) {
        companyName = $("strong").first().text().trim();
    }
    let loc = $("span[property='addressLocality']").text() + ' ' +
        $("span[property='addressRegion']").text();

    let roleFields = {
        name: posTitle,
        company: companyName,
        description: jobDescription,
        wage: "temp",
        location: loc
    }

    return createNewJob(fields, roleFields)
}


module.exports.getPage = getPage
module.exports.indeedScraper = indeedScraper
module.exports.jobBankScraper = jobBankScraper
module.exports.workopolisScraper = workopolisScraper
