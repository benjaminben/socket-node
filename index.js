var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
})

app.get('/game.js', function(req, res){
  res.sendFile(__dirname + '/game.js');
})

app.get('/remote', function(req, res){
  res.sendFile(__dirname + '/controller.html')
})

server.listen(8000, function(){
  console.log('listening on *:8000')
})



var players = [];
var Player = function(){
  this.x = (Math.floor(Math.random() * (100)));
  this.y = (Math.floor(Math.random() * (100)));
  this.width = 10;
  this.height = 10;
  this.generateId = function(){
              var chars = "abcdefghijklmnopqrstuvwxyz";
              var id = "";
              for( var i = 0; i <= 3; i++ ){
                if( i === 3 ){
                  return id;
                }
                id += chars.charAt(Math.floor(Math.random() * chars.length))
              }
            };
  this.id = this.generateId();
};

io.on('connection', function(socket){
  console.log(socket.request.headers.referer);
  if( socket.request.headers.referer.indexOf('remote') === -1 ){
    socket.player = new Player();
    players.push(socket.player)
    console.log(players)
    io.emit('enter', {players : players, id : socket.player.id});
    var player_index = players.indexOf(socket.player);

    app.get('/remote/' + socket.player.id, function(req, res){
      res.sendFile(__dirname + '/controller.html')
    })
    socket.on('disconnect', function(){
      players.splice(player_index, 1);
      console.log(players);
      io.emit('exit', players)
    })
  }
  else{
    socket.on('up', function(request_id){
      var le_player = players.filter(function(p){if(p.id === request_id){return p}})[0];
      players[players.indexOf(le_player)].y -= 10;
      io.emit('update', players);
    })
    socket.on('left', function(request_id){
      var le_player = players.filter(function(p){if(p.id === request_id){return p}})[0];
      players[players.indexOf(le_player)].x-= 10;
      io.emit('update', players);
    })
    socket.on('right', function(request_id){
      var le_player = players.filter(function(p){if(p.id === request_id){return p}})[0];
      players[players.indexOf(le_player)].x += 10;
      io.emit('update', players);
    })
    socket.on('down', function(request_id){
      var le_player = players.filter(function(p){if(p.id === request_id){return p}})[0];
      players[players.indexOf(le_player)].y += 10;
      io.emit('update', players);
    })
  }

})
