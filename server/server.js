const http = require('http');
const handle = require('./handlers');
const url = require("url");

let handles = {};
handles["/channel"] = handle.showChannel;
handles["/delete"] = handle.deleteRule;
handles["/insert"] = handle.insertRule;
handles["/mon"] = handle.monitor;
handles["/settings"] = handle.settings;
handles["/chainlist"] = handle.chainList;

http.createServer(function handler(req, res) {
    let pathname = url.parse(req.url).pathname;
    req.setEncoding("utf8");
	handles[pathname](req, res);
}).listen(1337);
console.log('Server running at http://*:1337/');