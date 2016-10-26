var handler = function(req, res) {
    fs.readFile('./index.html', function (err, data) {
        if(err) throw err;
        res.writeHead(200);
        res.end(data);
    });
}
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var Moniker = require('moniker');
var port = 7777;

app.listen(port);
io.sockets.on('connection', function (socket) {
    var user = addUser();
    updateClick();
    socket.emit("welcome", user);
    socket.on('disconnect', function () {
        removeUser(user);
    });
    socket.on("click", function() {
        currentClick += 1;
        user.clicks += 1;
        if(currentClick == winClick) {
            currentClick = initialClick;
            io.sockets.emit("win", { message: "<strong>" + user.name + "</strong> <font color=red>WIN OH YEAH!</font>" });
        }
        updateClick();
        updateUsers();
    });
});
var initialClick = 0;
var currentClick = initialClick;
var winClick = 150;
var users = [];

var addUser = function() {
    var user = {
        name: Moniker.choose(),
        clicks: 0
    }
    users.push(user);
    updateUsers();
    return user;
}
var removeUser = function(user) {
    for(var i=0; i<users.length; i++) {
        if(user.name === users[i].name) {
            users.splice(i, 1);
            updateUsers();
            return;
        }
    }
}
var updateUsers = function() {
    var str = '';
    for(var i=0; i<users.length; i++) {
        var user = users[i];
        str += '+ ' + user.name + '<small>(' + user.clicks + ' clicks)</small></br>';
    }
    io.sockets.emit("users", { users: str });
}
var updateClick = function() {
    io.sockets.emit("update", { currentClick: currentClick });
}
