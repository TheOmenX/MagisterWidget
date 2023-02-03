var express = require('express')
const app = express();
const puppeteer = require('puppeteer');
const node_fetch = require('node-fetch');
require('dotenv').config()

let users:Array<UserData> = [];

app.use(express.static(__dirname)); 

interface User {
    leerling_nummer: number,
    password: string,
}

interface UserData extends User {
    expires_at: number,
    bearer_token: string,
}

interface LaatsteCijfer{
    waarde: string,
    vak: string,
    weegfactor: number,
    omschrijving: string,
}

// Generating JWT
const generateBearerToken = async (login:User): Promise<UserData> => {
    const username = login.leerling_nummer;
    const password = login.password;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://canisius.magister.net', { waitUntil: 'networkidle0' }); // Navigate to login page, wait till redirect is succesfull
  console.log('Login page loaded')

  await page.type('#username', `${username}`);

  try {
    await Promise.all([
        page.click('#username_submit'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 100000 }),
      ]);
      console.log('Submitted username and redirected to microsoft login page')
  } catch (error) {
        throw new Error('User failed to log in. *Wrong Id*')
  }

  await page.evaluate((val:any) => (<HTMLInputElement>document.querySelector('#i0118')!).value = val, password);

  await Promise.all([
    page.click('#idSIButton9'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  console.log('Submitted password and signed in')

  try {
    await Promise.all([
        page.click('#idSIButton9'),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 100000 }),
    ]);
    console.log('Skipped popup')
  } catch (error) {
    throw new Error ('User failed to log in. *Wrong Password*')
  }


  const sessionStorage = await page.evaluate(() =>  Object.assign({}, window.sessionStorage));
  console.log('Grabbed bearer token')
  await browser.close();
  const data = JSON.parse(sessionStorage[Object.keys(sessionStorage)[0]])
  console.log('Data parsed')
  return {
    leerling_nummer: username,
    password: password,
    expires_at: data.expires_at,
    bearer_token: data.access_token
}
};

//Setup Users
function updateUsers() {
    const jsonString:string = process.env.LEERLINGEN2 ? process.env.LEERLINGEN2 : ''
    try {
        const jsonData:Array<User> = JSON.parse(jsonString);
        jsonData.forEach(async (userLogin)=>{
            let user = await generateBearerToken(userLogin)
            users.push(user)
        })
    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
}

updateUsers()
setInterval(updateUsers, 1000 * 60 * 60 * 1.5)

app.get('/api/cijfer', async (req: any, res:any) => {
    let userData:any = users.find((user) => user.leerling_nummer == req.query.username)
    if(!userData) {res.status(300).json({message:"User not found"}); return}
    const cijferResponse:any = await node_fetch("https://canisius.magister.net/api/personen/21508/cijfers/laatste?top=1&skip=0", {
        headers: {'authorization': `Bearer ${userData.bearer_token}`},
        method: 'GET'
    })

    const cijferData:any = await cijferResponse.json()

    const cijfer:LaatsteCijfer = {
        waarde: cijferData.items[0].waarde,
        vak: cijferData.items[0].vak.code,
        weegfactor: cijferData.items[0].weegfactor,
        omschrijving: cijferData.items[0].omschrijving,
    }

    res.status(200).json(cijfer)
})
  
app.get('*', (req: any, res: any) => {
    res.status(404).json({
        message: 'Not found'
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${process.env.PORT || 3000}`)
})
