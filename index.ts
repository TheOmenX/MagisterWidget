
var express = require('express')
const app = express();
const puppeteer = require('puppeteer');
const request = require('request');
const nodeHtmlToImage = require('node-html-to-image')

app.use(express.static(__dirname)); 

interface User {
    status: number,
    message: string,
    leerling_nummer?: number,
    naam?: string,
    expires_at?: number,
    bearer_token?: string,
}
let users: User[] = []

// Generating JWT
const generateBearerToken = async (username:number, password:string): Promise<User> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://canisius.magister.net', { waitUntil: 'networkidle0' }); // Navigate to login page, wait till redirect is succesfull
  console.log('Login page loaded')

  await page.type('#username', `${username}`);

  try {
    await Promise.all([
        page.click('#username_submit'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      ]);
      console.log('Submitted username and redirected to microsoft login page')
  } catch (error) {
        return {status: 400, message: 'User failed to log in. *Wrong Id*'}
  }

  await page.evaluate(val => document.querySelector('#i0118').value = val, password);

  await Promise.all([
    page.click('#idSIButton9'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  console.log('Submitted password and signed in')

  try {
    await Promise.all([
        page.click('#idSIButton9'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
    ]);
    console.log('Skipped popup')
  } catch (error) {
    return {status: 400, message: 'User failed to log in. *Wrong Password*'}
  }


  const sessionStorage = await page.evaluate(() =>  Object.assign({}, window.sessionStorage));
  await browser.close();
  const data = JSON.parse(sessionStorage[Object.keys(sessionStorage)[0]])
  return {
    status: 200,
    message: 'User succesfully logged in',
    leerling_nummer: username,
    naam: `${data.profile.given_name} ${data.profile.family_name}`,
    expires_at: data.expires_at,
    bearer_token: data.access_token
  }
};

const validateUser = async(headers: any): Promise<User> => {
    const username:number = headers.username;
    const password:string = headers.password;
    let data: User | Error;
    if(!username || !password){
        return {status: 400, message: 'Incorrect headers'}
    }
    const indexUser = users.findIndex(e => e.leerling_nummer === username)
    if(indexUser === -1){
        console.log('Creating new user')
        data = await generateBearerToken(username, password)
        users.push(data)
    }else{
        if(users[indexUser].expires_at < Date.now()/1000){ // If token expired
            data = await generateBearerToken(username, password)
            users.push(data)
        }else{
            data = users[indexUser]
        }
    }
    return data
}



app.get('/api/user', async (req: any, res: any) => {
    let data = await validateUser(req.headers)
    res.status(data.status).json(data)
})

app.get('/api/image', async (req: any, res: any) => {
    console.log('request made')
    nodeHtmlToImage({
        output: './images/151563.png',
        html: `<html>
          <head>
            <style>
              body {
                width: 364px;
                height: 170px;
                background-color: red;
              }
            </style>
          </head>
          <body>Hello world!</body>
        </html>
        `
      })
        .then(() => console.log('The image was created successfully!'))
    res.json([
        'http://192.168.2.111:3000/images/151563.png'
    ])

})

app.get('/api/user/rooster', async (req: any, res: any) => {
    let data = await validateUser(req.headers)
    if(data.status !== 200) {res.status(data.status).json(data); return}


    var options = {
        url: 'https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=2022-09-02&van=2022-08-26',
        headers: {'authorization': `Bearer ${data.bearer_token}`}
    };

    request(options, (error:any, response:any, body:any) => {
        if (!error && response.statusCode == 200) {
            res.json(JSON.parse(body))
        }else {
        }
    });
})

app.get('/api/user/cijfers', async (req: any, res: any) => {
    let data = await validateUser(req.headers)
    if(data.status !== 200) {res.status(data.status).json(data); return}


    res.json(data)
})

app.get('*', (req: any, res: any) => {
    res.status(404).json({
        message: 'Not found'
    })
})
  
app.listen(3000, () => {
    console.log('Listening on port 3000')
})
