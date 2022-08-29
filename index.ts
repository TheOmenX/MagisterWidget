
var express = require('express')
const app = express();
const puppeteer = require('puppeteer');
const request = require('request');
const node_fetch = require('node-fetch');
const nodeHtmlToImage = require('node-html-to-image')
const  { v4: uuidv4 }  = require('uuid');
const fs = require('fs');
const nocache = require('nocache');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};


app.use(nocache());
app.set('etag', false)
app.use(express.static(__dirname)); 

const maandenLijst = ['Januari', 'Februari', 'Maart', 'April', 'Mei' ,'Juni' ,
            'Juli','Augustus' ,'September','Oktober','November','December' ]

const dagenLijst = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'] 

interface User {
    status: number,
    message: string,
    leerling_nummer?: number,
    naam?: string,
    expires_at?: number,
    bearer_token?: string,
    image?: string,
}

interface MagisterData {
    Items: Array<MagisterRooster>,
    TotalCount: number,
}

interface MagisterRooster {
    Start: string,
    Einde: string,
    LesuurVan: number,
    Omschrijving: string,
    Lokatie: string
}

interface RoosterVak {
    start: string,
    einde: string,
    lesuur: number,
    omschrijving: string,
    locatie: string
}

type pastItem = {
    links: Array<string>,
    count: number,
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

  await page.evaluate((val:any) => (<HTMLInputElement>document.querySelector('#i0118')!).value = val, password);

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

    let data: User | Error = users.find(user => user.leerling_nummer == username) ?? {status: 500, message: 'An error occured'};
    if(data.status === 200) return data;
    if(!username || !password){
        return {status: 400, message: 'Incorrect headers'}
    }
    const indexUser = users.findIndex(e => e.leerling_nummer === username)
    if(indexUser === -1){
        console.log('Creating new user')
        data = await generateBearerToken(username, password)
        users.push(data)
    }else{
        if(users[indexUser].expires_at ?? Date.now() < Date.now()/1000){ // If token expired
            data = await generateBearerToken(username, password)
            users.push(data)
            data = users[indexUser]
        }
    }
    return data
}



app.get('/api/user', async (req: any, res: any) => {
    let userData = await validateUser(req.query)

    if(userData.status === 400) res.send(userData)
    //#region Requesting Rooster Data
    let date:Date = new Date(Date.now())
    let roosterData:MagisterData;
    let dateFormat:string;
    do {
        dateFormat = date.toISOString().split('T')[0]
        const roosterResponse = await node_fetch(`https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=${dateFormat}&van=${dateFormat}`, {
            headers: {'authorization': `Bearer ${userData.bearer_token}`},
            method: 'GET'
        })
    
        roosterData = await roosterResponse.json()
        date.setDate(date.getDate() + 1)
    } while (roosterData?.TotalCount === 0);
    date.setDate(date.getDate() - 1)
    
    let files = await fs.readdirSync('./images')

    for(let file of files){
        if(file.startsWith(`${userData.leerling_nummer}`)){
            if(!file.startsWith(`${userData.leerling_nummer}-${dateFormat}`)) fs.unlinkSync(`./images/${file}`)
        }
    }



    const roosters:Array<RoosterVak> = roosterData.Items.map(item => {return {
        start: item.Start,
        einde: item.Einde,
        lesuur: item.LesuurVan ?? '-',
        omschrijving: item.Omschrijving,
        locatie: item.Lokatie,
    }})

    const imagePath = `images/151563-${dateFormat}.png`
    nodeHtmlToImage({
        output: `./${imagePath}`,
        html: `<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://use.typekit.net/rre3fdy.css">
            <style>
                :root {
                    --blue: #0f2949;
                    --black: #151519;
                    --grey: #e5e5e5;
                    --dark-grey: #606062;
                }
                html{
                    background-color: white;
                    margin: 0;
                }
        
                * {
                    font-family: arboria, sans-serif;
                }
        
                body{
                    width: 728px;
                    height: 340px;
                    background-color: var(--blue);
                    color: white;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                }
        
                .datum {
                    padding: 8px 40px;
                    border-bottom: 2px solid var(--dark-grey);
                }
        
                .datum > h3 {
                    margin: 0
                }
        
                .data {
                    display: flex;
                    flex: 1;
                    background-color: var(--black);
                }
        
                .rooster{
                    width: 65%;
                }
        
                .les{
                    display: flex;
                    flex-direction: row;
                    height: 30px;
                    font-size: larger;
                    align-items: center;
                    border-bottom: var(--dark-grey) 1px solid;
                }
        
                .uur{
                    width: 24px;
                    height: 24px;
                    margin: 1px 20px;
                    background-color: var(--blue);
                    text-align: center;
                    border-radius: 4px;
                    font-weight: 800;
                    line-height: 22px;
                }
        
                .les strong {
                    margin-right: 20px
                }
        
                .nieuws {
                    width: 35%;
                    border-left: var(--dark-grey) 2px solid;
                    display: flex;
                    flex-direction: column;
                }
                .nieuws > * {
                    height: 142px;
                }
        
                .bericht {
                    border-bottom: var(--dark-grey) 2px solid;
                }
        
                .cijfer{
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-evenly;
                }
        
                .cijfer .info {
                    display: flex;
                    flex-direction: column;
                }
        
                .cijfer > span{
                    width: 100px;
                    height: 100px;
                    background-color: var(--blue);
                    text-align: center;
                    font-size: xxx-large;
                    font-weight: 800;
                    padding:auto;
                    line-height: 100px;
                    border-radius: 10px;
                }
            </style>
        </head>
        <body>
            <div class="datum">
                <h3>${dagenLijst[date.getDay()-1]} ${date.getDate()} ${maandenLijst[date.getMonth()]}</h3>
            </div>
            <div class="data">
                <div class="rooster">
                    ${roosters.map(vak => {
                        return `
                            <div class="les">
                                <div class="uur">
                                    ${vak.lesuur}
                                </div>
                                <strong> ${vak.omschrijving} (A115)</strong>
                                <span> ${Number(vak.start.split('T')[1].split(':')[0])+2}:${vak.start.split('T')[1].split(':')[1]} - ${Number(vak.einde.split('T')[1].split(':')[0])+2}:${vak.einde.split('T')[1].split(':')[1]}</span>
                            </div>
                        `
                    }).toString().replace(/,/g, '')}
                </div>
                <div class="nieuws">
                    <div class="bericht">
        
                    </div>
                    <div class="cijfer">
                        <span> 9.1</span>
                        <div class="info">
                            <span>Netl</span>
                            <span>11-9</span>
                            <span>15x</span>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>`
      })
        .then(() => res.sendFile('./images/151563-2022-08-30.png', { root: __dirname }))



    
    const requestRooster =  (date:Date) => {
        const dateFormat = date.toISOString().split('T')[0]
        console.log(dateFormat)
        const options = {
            url: `https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=${dateFormat}&van=${dateFormat}`,
            headers: {'authorization': `Bearer ${userData.bearer_token}`}
        };

        console.log(options)
        request(options, (error:any, response:any, body:string) => {
            if (!error && response.statusCode == 200) {
                const data:MagisterData = JSON.parse(body)
                date.setDate(date.getDate() + 1)
                if(data.TotalCount === 0) {requestRooster(date)}
                else return
            }else {
                console.log(error)
            }
        });
    }
})

app.get('/api/test', async (req: any, res: any) => {
    
    console.log(req.query)

    res.sendFile('./images/151563-2022-08-30.png', { root: __dirname })

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
  
app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000')
})