import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer();
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
});

server.on('upgrade', function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});

server.on('request', function request(req, res) {
  wss.clients.forEach(client => {
    client.send('reload');
  });
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'OK' }));
});

server.listen(9999, () => {
  console.log('Hot Contract Reload: Server is running on port 9999');
});
