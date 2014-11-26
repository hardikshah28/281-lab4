
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var Client = require('node-rest-client').Client;
var client = new Client();
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var dt = {};
var app = express();
var server = http.createServer(app);

// all environments
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
//app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', 
	function(req,res){
			client.get("http://nkukday-grails-gubmall-v2.cfapps.io/gumballs", function(data, response){
            dt['id'] = data[0].id;
            dt['countGumballs'] = data[0].countGumballs;
            dt['modelNumber'] = data[0].modelNumber;
            dt['serialNumber'] = data[0].serialNumber;
            dt['state'] = "NoCoinState";

            console.log(dt);
            res.render('index.ejs', { title: 'Gumball Version2',data:dt });
        });
}
);
app.post('/GumballPost', function(req,res){
	var event=req.param('event');
	var state=req.param('state');
	var cnt=req.param('count');
	var modelNumber=req.param('modelNumber');
	var serialNumber=req.param('serialNumber');
	var state=req.param('state');
	var id=req.param('id');

	var dt={};
	dt['id'] = id;
    dt['modelNumber'] = modelNumber;
    dt['serialNumber'] = serialNumber;

	if(event==='InsertQuater' && (state==='NoCoinState' || state==='AcceptedState')){
		if(cnt>0)	{		
			state='HasACoin';
	        dt['countGumballs'] = cnt;
	        dt['state'] = state;
	        res.render('index.ejs', { data: dt });
		} else {
			dt['countGumballs'] = cnt;
            dt['state'] = "OutOfGumballs";
         	res.render('index.ejs', { data: dt });
		}		
	}
	if(event==='TurnTheCrank' && state==='HasACoin'){
		if(cnt>0)	{
			var count = --cnt;
			state='AcceptedState';
            dt['countGumballs'] = count;
            dt['state'] = state;
            res.render('index.ejs', { data: dt });
		
         }
         else {
         	dt['countGumballs'] = cnt;
            dt['state'] = "OutOfGumballs";
         	res.render('index.ejs', { data: dt });
         }
	} else {
            dt['countGumballs'] = cnt;
            dt['state'] = "NoCoinState";
			res.render('index.ejs', { data: dt });
	}
});

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});


server.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});
