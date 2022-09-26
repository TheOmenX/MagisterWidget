var express = require('express')
const app = express();
const puppeteer = require('puppeteer');
const request = require('request');
const node_fetch = require('node-fetch');
const nodeHtmlToImage = require('node-html-to-image')
const fs = require('fs');

let users:Array<UserData> = [];

//Setup Users
function updateUsers() {
    fs.readFile("./users.json", "utf8", (err:Error, jsonString:string) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    try {
        const jsonData:Array<User> = JSON.parse(jsonString);
        jsonData.forEach(async (userLogin)=>{
            let user = await generateBearerToken(userLogin)
            users.push(user)
        })
    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
    });
}

updateUsers()
setInterval(updateUsers, 1000 * 60 * 60 * 1.5)


app.use(express.static(__dirname)); 

const maandenLijst = ['Januari', 'Februari', 'Maart', 'April', 'Mei' ,'Juni' ,
            'Juli','Augustus' ,'September','Oktober','November','December' ]

const dagenLijst = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'] 

interface User {
    leerling_nummer: number,
    password: string,
}

interface UserData extends User {
    expires_at: number,
    bearer_token: string,
}

interface MagisterData {
    Items: Array<MagisterRooster>,
    TotalCount: number,
}

interface LaatsteCijfer{
    waarde: string,
    vak: string,
    weegfactor: number,
    datum:Date,
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
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
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
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
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

app.get('/api/user', async (req: any, res: any) => {
    let userData:any = users.find((user) => user.leerling_nummer == req.query.username)
    if(!userData) {res.status(400).json({message: "No user found"}); return}
    if(userData.password !== req.query.password) {res.status(400).json({message: "Password not matching"}); return}


    //#region Requesting Rooster Data
    let date:Date = new Date(Date.now())
    let roosterData:MagisterData;
    let dateFormat:string;
    console.log('Starting rooster loop')
    do {
        dateFormat = date.toISOString().split('T')[0]
        const roosterResponse = await node_fetch(`https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=${dateFormat}&van=${dateFormat}`, {
            headers: {'authorization': `Bearer ${userData.bearer_token}`},
            method: 'GET'
        })
        roosterData = await roosterResponse.json()
        date.setDate(date.getDate() + 1)
    } while (roosterData?.TotalCount === 0 || new Date(roosterData.Items[roosterData.TotalCount-1].Einde) < new Date(Date.now()));
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


    //#region Cijfers

    const cijferResponse:any = await node_fetch("https://canisius.magister.net/api/personen/21508/cijfers/laatste?top=1&skip=0", {
        headers: {'authorization': `Bearer ${userData.bearer_token}`},
        method: 'GET'
    })

    const cijferData:any = await cijferResponse.json()

    const cijfer:LaatsteCijfer = {
        waarde: cijferData.items[0].waarde,
        vak: cijferData.items[0].vak.omschrijving,
        weegfactor: cijferData.items[0].weegfactor,
        datum: new Date(cijferData.items[0].ingevoerdOp)
    }


    //#endregion

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
                                <strong> ${vak.omschrijving} (${vak.locatie ?? "-"})</strong>
                                <span> ${Number(vak.start.split('T')[1].split(':')[0])+2}:${vak.start.split('T')[1].split(':')[1]} - ${Number(vak.einde.split('T')[1].split(':')[0])+2}:${vak.einde.split('T')[1].split(':')[1]}</span>
                            </div>
                        `
                    }).toString().replace(/,/g, '')}
                </div>
                <div class="nieuws">
                    <div class="bericht">
        
                    </div>
                    <div class="cijfer">
                        <span> ${cijfer.waarde}</span>
                        <div class="info">
                            <span>${cijfer.vak.substring(0, 1).toUpperCase() + cijfer.vak.substring(1)}</span>
                            <span>${cijfer.datum.getDate()}/${cijfer.datum.getMonth() + 1}</span>
                            <span>${cijfer.weegfactor}x</span>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>`,
        puppeteerArgs: { args: ["--no-sandbox"] }
      })
        .then(() => res.sendFile(`/${imagePath}`, { root: __dirname }))
    const requestRooster =  (date:Date) => {
        const dateFormat = date.toISOString().split('T')[0]
        const options = {
            url: `https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=${dateFormat}&van=${dateFormat}`,
            headers: {'authorization': `Bearer ${userData.bearer_token}`}
        };

        request(options, (error:any, response:any, body:string) => {
            if (!error && response.statusCode == 200) {
                const data:MagisterData = JSON.parse(body)
                date.setDate(date.getDate() + 1)
                if(data.TotalCount === 0) {requestRooster(date)}
                else return
            }else {
                throw Error(error)
            }
        });
    }
})

app.get('*', (req: any, res: any) => {
    res.status(404).json({
        message: 'Not found'
    })
})
  
app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${process.env.PORT || 3000}`)
})
