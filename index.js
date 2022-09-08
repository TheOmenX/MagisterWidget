"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require('express');
var app = express();
var puppeteer = require('puppeteer');
var request = require('request');
var node_fetch = require('node-fetch');
var nodeHtmlToImage = require('node-html-to-image');
var fs = require('fs');
var users = [];
//Setup Users
function updateUsers() {
    var _this = this;
    fs.readFile("./users.json", "utf8", function (err, jsonString) {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        try {
            var jsonData = JSON.parse(jsonString);
            console.log(jsonData);
            jsonData.forEach(function (userLogin) { return __awaiter(_this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, generateBearerToken(userLogin)];
                        case 1:
                            user = _a.sent();
                            users.push(user);
                            console.log(user);
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        catch (err) {
            console.log("Error parsing JSON string:", err);
        }
    });
}
updateUsers();
setInterval(updateUsers, 1000 * 60 * 60 * 1.5);
app.use(express.static(__dirname));
var maandenLijst = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
var dagenLijst = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
// // Generating JWT
var generateBearerToken = function (login) { return __awaiter(void 0, void 0, void 0, function () {
    var username, password, browser, page, error_1, error_2, sessionStorage, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = login.leerling_nummer;
                password = login.password;
                return [4 /*yield*/, puppeteer.launch({
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox']
                    })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                return [4 /*yield*/, page.goto('https://canisius.magister.net', { waitUntil: 'networkidle0' })];
            case 3:
                _a.sent(); // Navigate to login page, wait till redirect is succesfull
                console.log('Login page loaded');
                return [4 /*yield*/, page.type('#username', "".concat(username))];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, Promise.all([
                        page.click('#username_submit'),
                        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
                    ])];
            case 6:
                _a.sent();
                console.log('Submitted username and redirected to microsoft login page');
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                throw new Error('User failed to log in. *Wrong Id*');
            case 8: return [4 /*yield*/, page.evaluate(function (val) { return document.querySelector('#i0118').value = val; }, password)];
            case 9:
                _a.sent();
                return [4 /*yield*/, Promise.all([
                        page.click('#idSIButton9'),
                        page.waitForNavigation({ waitUntil: 'networkidle0' }),
                    ])];
            case 10:
                _a.sent();
                console.log('Submitted password and signed in');
                _a.label = 11;
            case 11:
                _a.trys.push([11, 13, , 14]);
                return [4 /*yield*/, Promise.all([
                        page.click('#idSIButton9'),
                        page.screenshot({ path: './images/img.png' }),
                        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
                    ])];
            case 12:
                _a.sent();
                console.log('Skipped popup');
                return [3 /*break*/, 14];
            case 13:
                error_2 = _a.sent();
                throw new Error('User failed to log in. *Wrong Password*');
            case 14: return [4 /*yield*/, page.evaluate(function () { return Object.assign({}, window.sessionStorage); })];
            case 15:
                sessionStorage = _a.sent();
                console.log('Grabbed bearer token');
                return [4 /*yield*/, browser.close()];
            case 16:
                _a.sent();
                data = JSON.parse(sessionStorage[Object.keys(sessionStorage)[0]]);
                console.log('Data parsed');
                return [2 /*return*/, {
                        leerling_nummer: username,
                        password: password,
                        expires_at: data.expires_at,
                        bearer_token: data.access_token
                    }];
        }
    });
}); };
// const validateUser = async(headers: any): Promise<User> => {
//     const username:number = headers.username;
//     const password:string = headers.password;
//     let data:User = users.find(user => user.leerling_nummer == username) ?? {status: 500, message: 'An error occured'};
//     if(data.status === 200) return data;
//     if(!username || !password){
//         return {status: 400, message: 'Incorrect headers'}
//     }
//     const indexUser = users.findIndex(e => e.leerling_nummer === username)
//     if(indexUser === -1){
//         console.log('Creating new user')
//         data = await generateBearerToken(username, password)
//         console.log('Finished creating user')
//         users.push(data)
//     }else{
//         if(users[indexUser].expires_at ?? Date.now() < Date.now()/1000){ // If token expired
//             data = await generateBearerToken(username, password)
//             users.push(data)
//             data = users[indexUser]
//         }
//     }
//     console.log('Validated user: ' + data)
//     return data
// }
app.get('/api/user', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userData, date, roosterData, dateFormat, roosterResponse, files, _i, files_1, file, roosters, imagePath, requestRooster;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userData = users.find(function (user) { return user.leerling_nummer == req.query.username; });
                if (!userData) {
                    res.status(400).json({ message: "No user found" });
                    return [2 /*return*/];
                }
                if (userData.password !== req.query.password) {
                    res.status(400).json({ message: "Password not matching" });
                    return [2 /*return*/];
                }
                date = new Date(Date.now());
                _a.label = 1;
            case 1:
                dateFormat = date.toISOString().split('T')[0];
                return [4 /*yield*/, node_fetch("https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=".concat(dateFormat, "&van=").concat(dateFormat), {
                        headers: { 'authorization': "Bearer ".concat(userData.bearer_token) },
                        method: 'GET'
                    })];
            case 2:
                roosterResponse = _a.sent();
                return [4 /*yield*/, roosterResponse.json()];
            case 3:
                roosterData = _a.sent();
                date.setDate(date.getDate() + 1);
                _a.label = 4;
            case 4:
                if ((roosterData === null || roosterData === void 0 ? void 0 : roosterData.TotalCount) === 0) return [3 /*break*/, 1];
                _a.label = 5;
            case 5:
                date.setDate(date.getDate() - 1);
                return [4 /*yield*/, fs.readdirSync('./images')];
            case 6:
                files = _a.sent();
                for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                    file = files_1[_i];
                    if (file.startsWith("".concat(userData.leerling_nummer))) {
                        if (!file.startsWith("".concat(userData.leerling_nummer, "-").concat(dateFormat)))
                            fs.unlinkSync("./images/".concat(file));
                    }
                }
                console.log("Final");
                console.log(roosterData.Items[roosterData.TotalCount - 1]);
                roosters = roosterData.Items.map(function (item) {
                    var _a;
                    return {
                        start: item.Start,
                        einde: item.Einde,
                        lesuur: (_a = item.LesuurVan) !== null && _a !== void 0 ? _a : '-',
                        omschrijving: item.Omschrijving,
                        locatie: item.Lokatie
                    };
                });
                imagePath = "images/151563-".concat(dateFormat, ".png");
                nodeHtmlToImage({
                    output: "./".concat(imagePath),
                    html: "<!DOCTYPE html>\n        <html>\n        <head>\n            <link rel=\"stylesheet\" href=\"https://use.typekit.net/rre3fdy.css\">\n            <style>\n                :root {\n                    --blue: #0f2949;\n                    --black: #151519;\n                    --grey: #e5e5e5;\n                    --dark-grey: #606062;\n                }\n                html{\n                    background-color: white;\n                    margin: 0;\n                }\n        \n                * {\n                    font-family: arboria, sans-serif;\n                }\n        \n                body{\n                    width: 728px;\n                    height: 340px;\n                    background-color: var(--blue);\n                    color: white;\n                    margin: 0;\n                    display: flex;\n                    flex-direction: column;\n                }\n        \n                .datum {\n                    padding: 8px 40px;\n                    border-bottom: 2px solid var(--dark-grey);\n                }\n        \n                .datum > h3 {\n                    margin: 0\n                }\n        \n                .data {\n                    display: flex;\n                    flex: 1;\n                    background-color: var(--black);\n                }\n        \n                .rooster{\n                    width: 65%;\n                }\n        \n                .les{\n                    display: flex;\n                    flex-direction: row;\n                    height: 30px;\n                    font-size: larger;\n                    align-items: center;\n                    border-bottom: var(--dark-grey) 1px solid;\n                }\n        \n                .uur{\n                    width: 24px;\n                    height: 24px;\n                    margin: 1px 20px;\n                    background-color: var(--blue);\n                    text-align: center;\n                    border-radius: 4px;\n                    font-weight: 800;\n                    line-height: 22px;\n                }\n        \n                .les strong {\n                    margin-right: 20px\n                }\n        \n                .nieuws {\n                    width: 35%;\n                    border-left: var(--dark-grey) 2px solid;\n                    display: flex;\n                    flex-direction: column;\n                }\n                .nieuws > * {\n                    height: 142px;\n                }\n        \n                .bericht {\n                    border-bottom: var(--dark-grey) 2px solid;\n                }\n        \n                .cijfer{\n                    display: flex;\n                    flex-direction: row;\n                    align-items: center;\n                    justify-content: space-evenly;\n                }\n        \n                .cijfer .info {\n                    display: flex;\n                    flex-direction: column;\n                }\n        \n                .cijfer > span{\n                    width: 100px;\n                    height: 100px;\n                    background-color: var(--blue);\n                    text-align: center;\n                    font-size: xxx-large;\n                    font-weight: 800;\n                    padding:auto;\n                    line-height: 100px;\n                    border-radius: 10px;\n                }\n            </style>\n        </head>\n        <body>\n            <div class=\"datum\">\n                <h3>".concat(dagenLijst[date.getDay() - 1], " ").concat(date.getDate(), " ").concat(maandenLijst[date.getMonth()], "</h3>\n            </div>\n            <div class=\"data\">\n                <div class=\"rooster\">\n                    ").concat(roosters.map(function (vak) {
                        return "\n                            <div class=\"les\">\n                                <div class=\"uur\">\n                                    ".concat(vak.lesuur, "\n                                </div>\n                                <strong> ").concat(vak.omschrijving, " (").concat(vak.locatie, ")</strong>\n                                <span> ").concat(Number(vak.start.split('T')[1].split(':')[0]) + 2, ":").concat(vak.start.split('T')[1].split(':')[1], " - ").concat(Number(vak.einde.split('T')[1].split(':')[0]) + 2, ":").concat(vak.einde.split('T')[1].split(':')[1], "</span>\n                            </div>\n                        ");
                    }).toString().replace(/,/g, ''), "\n                </div>\n                <div class=\"nieuws\">\n                    <div class=\"bericht\">\n        \n                    </div>\n                    <div class=\"cijfer\">\n                        <span> 9.1</span>\n                        <div class=\"info\">\n                            <span>Netl</span>\n                            <span>11-9</span>\n                            <span>15x</span>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </body>\n        </html>"),
                    puppeteerArgs: { args: ["--no-sandbox"] }
                })
                    .then(function () { return res.sendFile("/".concat(imagePath), { root: __dirname }); });
                requestRooster = function (date) {
                    var dateFormat = date.toISOString().split('T')[0];
                    console.log(dateFormat);
                    var options = {
                        url: "https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=".concat(dateFormat, "&van=").concat(dateFormat),
                        headers: { 'authorization': "Bearer ".concat(userData.bearer_token) }
                    };
                    console.log(options);
                    request(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var data = JSON.parse(body);
                            date.setDate(date.getDate() + 1);
                            if (data.TotalCount === 0) {
                                requestRooster(date);
                            }
                            else
                                return;
                        }
                        else {
                            console.log(error);
                        }
                    });
                };
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/test', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log(req.query);
        res.json(users);
        return [2 /*return*/];
    });
}); });
// app.get('/api/user/rooster', async (req: any, res: any) => {
//     let data = await validateUser(req.headers)
//     if(data.status !== 200) {res.status(data.status).json(data); return}
//     var options = {
//         url: 'https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=2022-09-02&van=2022-08-26',
//         headers: {'authorization': `Bearer ${data.bearer_token}`}
//     };
//     request(options, (error:any, response:any, body:any) => {
//         if (!error && response.statusCode == 200) {
//             res.json(JSON.parse(body))
//         }
//     });
// })
// app.get('/api/user/cijfers', async (req: any, res: any) => {
//     let data = await validateUser(req.headers)
//     if(data.status !== 200) {res.status(data.status).json(data); return}
//     res.json(data)
// })
app.get('*', function (req, res) {
    res.status(404).json({
        message: 'Not found'
    });
});
app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port ".concat(process.env.PORT || 3000));
});
