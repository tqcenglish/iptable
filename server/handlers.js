const proc = require('child_process');
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");

module.exports = {	
	showChannel: function(req, res) {
		let query = url.parse(req.url).query;
		let args = querystring.parse(query);

		let run = `iptables -t  ${args.t} -S  ${args.c.toUpperCase()}`;
		console.log("showChannel", run);
		proc.exec(run, (error, stdout, stderr) => {
			let arr = stdout.split("\n");
			res.end(JSON.stringify(arr));
		});
	},
	
	deleteRule: function(req, res) {
		let query = url.parse(req.url).query;
		let args = querystring.parse(query);
		
		proc.exec("iptables -t " + args.t + " -D " + args.c.toUpperCase() + " " + args.i, function(error, stdout, stderr) {
			module.exports.showChannel(req, res);
		});
	},
	
	insertRule: function (req, res) {
		let body = '';
	    req.on('data', (data) => {
	        body += data;
	    });
	    req.on('end', () => {
	        let rule = JSON.parse(body)['rule'];
	    	proc.exec("iptables " + rule, function(error, stdout, stderr) {
	    		if(stderr) {
	    			res.end(stderr);
	    		}
	    		else {
	    			module.exports.showChannel(req, res);
	    		}
	    	});
	    });
	},
	
	monitor: function(req, res) {
		let query = url.parse(req.url).query;
		let args = querystring.parse(query);

		let run = `iptables -t ${args.t}  -L  ${args.c.toUpperCase()} -vn`;
		console.log("monitor",run);
		proc.exec(run, (error, stdout, stderr) => {
			let arr = stdout.split("\n");
			res.writeHead(200, {"Cache-Control": "no-cache"});
			res.end(JSON.stringify(arr));
		});
	},
	
	chainList: function(req, res) {
		let new_arr = [];
		let n = 0;
		
		proc.exec("iptables -S", function(error, stdout, stderr) {
			let arr = stdout.split("\n");
			
			let n = 0;
			for(var i = 0; i < arr.length; i++) {
				var item = arr[i];
				if(item.indexOf("-N") === 0) {
					new_arr[n++] = item.substring(3) + " (filter)";
				}
			}
			
			proc.exec("iptables -t nat -S", function(error, stdout, stderr) {
				var arr = stdout.split("\n");

				for(var i = 0; i < arr.length; i++) {
					var item = arr[i];
					if(item.indexOf("-N") === 0) {
						new_arr[n++] = item.substring(3) + " (nat)";
					}
				}

				proc.exec("iptables -t mangle -S", function(error, stdout, stderr) {
					var arr = stdout.split("\n");

					for(var i = 0; i < arr.length; i++) {
						var item = arr[i];
						if(item.indexOf("-N") === 0) {
							new_arr[n++] = item.substring(3) + " (mangle)";
						}
					}
					
					res.end(JSON.stringify(new_arr));
				});
			});
		});
	},
    
	settings: function(req, res) {
		var query = url.parse(req.url).query;
		var args = querystring.parse(query);
		
		if(args.c === "save") {
            var body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                var post = querystring.parse(body);
                var data = post['data'];
                
                module.exports._settings = JSON.parse(data);
                module.exports.saveSettings();
            });
			res.end();
		}
		else {
			let themes = ["DarkGray", "Navajo", "Silver"];
			res.end(JSON.stringify(themes));
		}
	},
};