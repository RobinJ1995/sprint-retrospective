const Express = require('express');

const PORT = 5431;

const server = Express();

server.use(Express.static(__dirname + '/build/'));
server.get('*', (req, res) => res.sendFile(__dirname + '/build/index.html'));

server.listen(PORT);
console.log(`Listening on port ${PORT}`);
