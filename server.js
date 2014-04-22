var express = require('express'),
    path = require('path'),
    http = require('http'),
    io = require('socket.io'),
    warehouse = require('./routes/warehouse');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3001);
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

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

sio.sockets.on('connection', function (socket) {
  socket.on('dbupdate', function (data) {
	 console.log(data);
	 var temp = data.model;
         socket.broadcast.emit('updates', {message:'Warehouse has been updates since last use!',model: temp});
  });
});
