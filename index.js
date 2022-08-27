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
var _this = this;
var express = require('express');
var app = express();
var puppeteer = require('puppeteer');
var request = require('request');
var nodeHtmlToImage = require('node-html-to-image');
app.use(express.static(__dirname));
var users = [];
// Generating JWT
var generateBearerToken = function (username, password) { return __awaiter(_this, void 0, void 0, function () {
    var browser, page, error_1, error_2, sessionStorage, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, puppeteer.launch()];
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
                return [2 /*return*/, { status: 400, message: 'User failed to log in. *Wrong Id*' }];
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
                        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
                    ])];
            case 12:
                _a.sent();
                console.log('Skipped popup');
                return [3 /*break*/, 14];
            case 13:
                error_2 = _a.sent();
                return [2 /*return*/, { status: 400, message: 'User failed to log in. *Wrong Password*' }];
            case 14: return [4 /*yield*/, page.evaluate(function () { return Object.assign({}, window.sessionStorage); })];
            case 15:
                sessionStorage = _a.sent();
                return [4 /*yield*/, browser.close()];
            case 16:
                _a.sent();
                data = JSON.parse(sessionStorage[Object.keys(sessionStorage)[0]]);
                return [2 /*return*/, {
                        status: 200,
                        message: 'User succesfully logged in',
                        leerling_nummer: username,
                        naam: "".concat(data.profile.given_name, " ").concat(data.profile.family_name),
                        expires_at: data.expires_at,
                        bearer_token: data.access_token
                    }];
        }
    });
}); };
var validateUser = function (headers) { return __awaiter(_this, void 0, void 0, function () {
    var username, password, data, indexUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = headers.username;
                password = headers.password;
                if (!username || !password) {
                    return [2 /*return*/, { status: 400, message: 'Incorrect headers' }];
                }
                indexUser = users.findIndex(function (e) { return e.leerling_nummer === username; });
                if (!(indexUser === -1)) return [3 /*break*/, 2];
                console.log('Creating new user');
                return [4 /*yield*/, generateBearerToken(username, password)];
            case 1:
                data = _a.sent();
                users.push(data);
                return [3 /*break*/, 5];
            case 2:
                if (!(users[indexUser].expires_at < Date.now() / 1000)) return [3 /*break*/, 4];
                return [4 /*yield*/, generateBearerToken(username, password)];
            case 3:
                data = _a.sent();
                users.push(data);
                return [3 /*break*/, 5];
            case 4:
                data = users[indexUser];
                _a.label = 5;
            case 5: return [2 /*return*/, data];
        }
    });
}); };
app.get('/api/user', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, validateUser(req.headers)];
            case 1:
                data = _a.sent();
                res.status(data.status).json(data);
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/image', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('request made');
        nodeHtmlToImage({
            output: './images/151563.png',
            html: "<html>\n          <head>\n            <style>\n              body {\n                width: 364px;\n                height: 170px;\n                background-color: red;\n              }\n            </style>\n          </head>\n          <body>Hello world!</body>\n        </html>\n        "
        })
            .then(function () { return console.log('The image was created successfully!'); });
        res.json([
            'http://192.168.2.111:3000/images/151563.png'
        ]);
        return [2 /*return*/];
    });
}); });
app.get('/api/user/rooster', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var data, options;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, validateUser(req.headers)];
            case 1:
                data = _a.sent();
                if (data.status !== 200) {
                    res.status(data.status).json(data);
                    return [2 /*return*/];
                }
                options = {
                    url: 'https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=2022-09-02&van=2022-08-26',
                    headers: { 'authorization': "Bearer ".concat(data.bearer_token) }
                };
                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        res.json(JSON.parse(body));
                    }
                    else {
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
app.get('/api/user/cijfers', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, validateUser(req.headers)];
            case 1:
                data = _a.sent();
                if (data.status !== 200) {
                    res.status(data.status).json(data);
                    return [2 /*return*/];
                }
                res.json(data);
                return [2 /*return*/];
        }
    });
}); });
app.get('*', function (req, res) {
    res.status(404).json({
        message: 'Not found'
    });
});
app.listen(3000, function () {
    console.log('Listening on port 3000');
});
