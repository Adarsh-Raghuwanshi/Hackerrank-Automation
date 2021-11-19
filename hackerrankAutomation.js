// input -> node hackerrankAutomation.js --config=config.json

let puppeteer = require('puppeteer');
let minimist = require('minimist');
let fs = require('fs');
let args = minimist(process.argv);

let configJson = fs.readFileSync(args.config, "utf-8");
let configJso = JSON.parse(configJson);

(async () => {
    // start the browser
    let browser = await puppeteer.launch({
        headless : false,
        defaultViewport: null,
        args: [
            "--start-maximized"
        ]
    });

    //launch first page
    let pages  = await browser.pages();
    let page = pages[0];
    await page.goto('https://www.hackerrank.com');

    await page.waitForSelector('a[data-event-action="Login"]');
    await page.click('a[data-event-action="Login"]');

    await page.waitForSelector('a[href="https://www.hackerrank.com/login"]');
    await page.click('a[href="https://www.hackerrank.com/login"]');

    //enter the id and password to get in.
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', configJso.userid, {delay : 100});
    await page.type('input[name="password"]', configJso.password, {delay : 100});
    await page.click('button[data-analytics="LoginPassword"]');

    await page.waitForSelector('a[data-analytics="NavBarContests"]');
    await page.click('a[data-analytics="NavBarContests"]');

    await page.waitForSelector('a[href="/administration/contests/"]');
    await page.click('a[href="/administration/contests/"]');

    //here we get the total no of pages.
    await page.waitForSelector("a[data-attr1='Last']");
    let totalPages = await page.$eval("a[data-attr1='Last']", (atag) => parseInt(atag.getAttribute('data-page')));
    
    for(let i = 0; i < totalPages; i++){
        await handlePages(browser, page);
    }

    await browser.close();
})();

//here we enter at particular page and do what we want at each page by an other function.
async function handlePages(browser, page){

    //here we count the no. of contests in a page.
    await page.waitForSelector('a.backbone.block-center');
    let curls = await page.$$eval('a.backbone.block-center', atag => atag.map(urls => urls.getAttribute('href')));
    for(let i = 0; i < curls.length; i++){
        await handleContest(browser, curls[i], page);
    }

    await page.waitForTimeout(1500);
    await page.waitForSelector("a[data-attr1='Right']");
    await page.click("a[data-attr1='Right']");
}

//here we enter at particular contest and do what we want by an other function.
async function handleContest(browser, url, page){
    let npage = await browser.newPage();
    await npage.goto("https://www.hackerrank.com" + url);
    await npage.waitForTimeout(2000);

    await npage.waitForSelector('li[data-tab="moderators"]');
    await npage.click('li[data-tab="moderators"]');

    //await npage.waitForTimeout(2000);
    for(let i = 0; i < configJso.moderators.length; i++){
        await npage.waitForSelector("input#moderator");
        await npage.type("input#moderator", configJso.moderators[i], { delay: 100 });
        await npage.keyboard.press('Enter');
        await npage.waitForTimeout(1200);
    }

    await npage.waitForTimeout(2000);
    await npage.close();
    await page.waitForTimeout(1500);
}
