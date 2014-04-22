var express = require('express'),
    path = require('path'),
    http = require('http'),
    io = require('socket.io'),
    warehouse = require('./routes/warehouse');

var app = express();
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.configure(function () {
    app.set('port', server_port);
    app.set('ip_address',server_ip_address);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/inbox', warehouse.findInboxItems);
app.put('/inbox', warehouse.updateInbox);
app.post('/inbox', warehouse.addBoxToShelf);
app.get('/warehouse', warehouse.getWarehouse);
app.put('/warehouse', warehouse.moveBox);

var server = http.createServer(app);

var sio = io.listen(server);

server.listen(server_port, server_ip_address, function(){
  console.log("Express server listening on port " + app.get('port'));
});

sio.sockets.on('connection', function (socket) {
  socket.on('dbupdate', function (data) {
	 console.log(data);
	 var temp = data.model;
         socket.broadcast.emit('updates', {message:'Warehouse has been updates since last use!',model: temp});
  });
});
