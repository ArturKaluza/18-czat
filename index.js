const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const UsersService = require('./UserService');

const userService = new UsersService();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send(__dirname + '/index.html')
});

// socket nasłuchuje na wiadomość wejścia do czatu
io.on('connection', (socket) => {
  socket.on('join', (name) => {
// użytkowanika, który pojawił się w aplikacji zapisujemy do serwisu trzymającego listę osób w czacie
    userService.addUser({
      id: socket.id,
      name
    });
// aplikacja emituje zdarznie 'update', które akutlizuje informacje na temat listy urzytkowników każdemu nasłuchającemu na wydarzenie 'update'
    io.emit('update', {
      users: userService.getAllUser()
    });
  });

});

// nasłuchiwanie na wydarzenie 'disconnect' 
//socket.broadcast wysyłanie wiadomośći do wszystkich oprócz siebie samego
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    userService.removeUser(socket.id);
    socket.broadcast.emit('update', {
      users: userService.getAllUser()
    });
  });
});

//wysyłanie wiadomości do innych użytkowniów
io.on('connection', socket => {
  socket.on('message', message => {
    const {name} = userService.getUserById(socket.id);
    socket.broadcast.emit('message', {
      message: message.text,
      from: name
    });
  });
});

server.listen(3000, () => {
  console.log('listing on*:3000');
});