// var request = require('request');

// var headers = {
//     'authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1OTI0QTA0NzNEQjgwNURCM0RCOTlGQ0Y0OTFBNDA5QjU4QTg2MEZSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6IlJaSktCSFBiZ0YyejI1bjg5SkdrQ2JXS2hnOCJ9.eyJuYmYiOjE2NjE1Mjg5NDUsImV4cCI6MTY2MTUzMjU0NSwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5tYWdpc3Rlci5uZXQiLCJhdWQiOlsib3BwIiwiYXR0ZW5kYW5jZSIsImNhbGVuZGFyLmljYWwiLCJjYWxlbmRhci50by1kbyIsImh0dHBzOi8vYWNjb3VudHMubWFnaXN0ZXIubmV0L3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJNNi1jYW5pc2l1cy5tYWdpc3Rlci5uZXQiLCJzdWIiOiJlMmM0MTc2Zjk4ZmU0YjhjODk5M2NjNmM3YjBlNTUzNCIsImF1dGhfdGltZSI6MTY2MTUyODk0NCwiaWRwIjoiQ2FuaXNpdXMgQ29sbGVnZSIsInRpZCI6ImFlZDZjNmY1OWY0ODQ4YTM4ZjZmN2U2ZmY0MTVmMDViIiwianRpIjoiODFBNDgzMURCQ0Y4MjU3QjYwNTNBOTY0RkYxQkZFMEMiLCJzaWQiOiI0NjExNzlGOUZCMjE2QzZGQ0JCQkY3RjM1ODZBMDI4NSIsImlhdCI6MTY2MTUyODk0NSwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsIm9wcC5yZWFkIiwib3BwLm1hbmFnZSIsImF0dGVuZGFuY2Uub3ZlcnZpZXciLCJjYWxlbmRhci5pY2FsLnVzZXIiLCJjYWxlbmRhci50by1kby51c2VyIl0sImFtciI6WyJwd2QiXX0.Ackeym0BaQvPS6drV-Sy5LAkizOErkHx_jSZ13M7Lxi-GB1e_1R39LHyc0lN8mt2XGdQxPiTh2C8BeTMxdcLAUxGfc7ExymozPeOoeBNrzYyCePqHevCgDmkmfCmiNrh7J2JRalA8UKXwF2TzZCnuJ0jCjnXAf2P2EKLD07p-GZeJnZm8n2beCu-aGJs5sBVTqPrjDwVf5zYj9ZZsrxySV-gfVtoWOB42dmwfUK93YDxKVaE6Y2paZdrKU96qo-gX_34FO95pAvzmWYYPOYKvCplqkgnQhChW_FUuvxy4pGAAXTIdydr-ZhbslBY1gPnZdPfEeuQOJdCzJDZda1y-g',

// };

// var options = {
//     url: 'https://canisius.magister.net/api/personen/21508/afspraken?status=1&tot=2022-09-02&van=2022-08-26',
//     headers: headers
// };

// function callback(error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log(body);
//     }
// }

// request(options, callback);

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();