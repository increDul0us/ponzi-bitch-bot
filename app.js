const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const User = require('./models/user');
var express = require('express');
var app = express();

const CreateAccount = async(page)=>{
  if(!page){
    let browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });  
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.finworldconsults.com/register.php');
  }
  
  let GetSelectValue = async(id,valuetext)=>{
    let $elemHandler = await page.$(`[name=${id}]`);
    let properties = await $elemHandler.getProperties();
    let value;
    for (const property of properties.values()) {
      const element = property.asElement();
      if (element){
        let hText = await element.getProperty("text");
        let text = await hText.jsonValue();
        if(text.toLowerCase().includes(valuetext)){
          let hValue = await element.getProperty("value");
          value = await hValue.jsonValue();
          // console.log(`Selected ${text} which is value ${value}.`);
        }
      }
    }
    return value;
  }

  let bname = await GetSelectValue('bname','access');
  let question = await GetSelectValue('question', 'child');

  const RandomStringGenerator =()=> Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
  const RandomNumberGenerator =()=> Math.floor(Math.random() * 2) + ''+(Math.floor(Math.random() * 900000000) + 10000000);
  let fname = RandomStringGenerator();
  let lname = RandomStringGenerator();
  let uname = RandomStringGenerator();
  let email = RandomStringGenerator()+'@gmail.com';
  let phone = '08'+''+RandomNumberGenerator();
  let password = email;
  let cpassword = email;
  let acctnum = phone;
  let answer = RandomStringGenerator();;

  // await page.evaluate((sel) => {
  //     var elements = document.querySelectorAll(sel);
  //     for(var i=0; i< elements.length; i++){
  //         elements[i].parentNode.removeChild(elements[i]);
  //     }
  // }, '[name="title"]')
  await page.type('[name="fname"]', fname);
  await page.type('[name="lname"]', lname);
  await page.type('[name="uname"]', uname);
  await page.type('[name="email"]', email);
  await page.type('[name="phone"]', phone);
  await page.type('[name="password"]', password);
  await page.type('[name="cpassword"]', cpassword);
  await page.type('[name="acctnum"]', acctnum);
  await page.type('[name="answer"]', answer);
  await page.select('[name="bname"]', bname);
  await page.select('[name="question"]', question);

  await page.$eval('[name="register"]', el => el.disabled = false);
  await page.click('[name="register"]');
  await page.waitForNavigation();
  SaveUser({ uname, email, password, dateCrawled: new Date() });
  console.log('New Account Created.')
  await page.goto('https://www.finworldconsults.com/register.php');
  await CreateAccount(page);
  // await Login(page, email, password);
}
const Login = async(page, useremail, password)=>{
  if(!page){
    let browser = await puppeteer.launch({
      headless: false
    });  
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.finworldconsults.com/login.php');
  }
  await page.type('[name="useremail"]', useremail);
  await page.type('[name="password"]', password);

  await page.click('[name="login"]');
  await page.waitForNavigation();
  await SubmitUpload(page);
}
const SubmitUpload = async(page)=>{
  if(!page){
    let browser = await puppeteer.launch({
      headless: false
    });  
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.finworldconsults.com/dashboard/user/dashboard.php');
  }
  const UploadFile = async(id,image)=>{
    // get the selector input type=file (for upload file)
    await page.waitForSelector(`input[name=${id}]`);
    await page.waitFor(1000);
  
    // get the ElementHandle of the selector above
    const inputUploadHandle = await page.$(`input[name=${id}]`);
    let fileToUpload = image;
  
    // Sets the value of the file input to fileToUpload
    inputUploadHandle.uploadFile(fileToUpload);
  }

  await UploadFile('task1', 'task1.png')
  await UploadFile('task2', 'task2.png')
  await UploadFile('task3', 'task3.png')

  await page.click('[name="submittask"]');
  // await page.waitForNavigation();
  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://www.finworldconsults.com/dashboard/action/logout.php');
  await page.goto('https://www.finworldconsults.com/register.php');
  await CreateAccount(page)
}

const SaveUser = (userObj)=> {
  const DB_URL = 'mongodb+srv://incredulous:incredulous@elibrary-2x3d7.mongodb.net/test?retryWrites=true';

  if (mongoose.connection.readyState == 0) {
    mongoose.connect(DB_URL);
  }

  // if this email exists, update the entry, don't insert
  const conditions = { email: userObj.email };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User.findOneAndUpdate(conditions, userObj, options, (err, result) => {
    console.log({result});
    if (err) {
      throw err;
    }
  });
}
// for (let i = 0; i<=100; i++ ){
  CreateAccount();
// }
// Login(null, 'username', 'password');
module.exports = app;
