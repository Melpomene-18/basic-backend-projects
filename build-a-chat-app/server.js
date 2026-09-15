import http from 'http';
import fs from 'fs';
import { WebSocket, WebSocketServer } from 'ws';

const PORT = 3001;

// Default requests send the chat client interface from public.
const server = http.createServer((req, res) => {
    fs.readFile('./public/index.html', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error.');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

// Creates our websocket server.
const wss = new WebSocketServer({ server });

wss.on('connection', (socket, req) => {
    // Obtains the username from url parameters.
    const username =
        new URL(req.url, 'ws://localhost').searchParams.get('username') ??
        'Anonymous';
  
    // Function to broadcast messages to all connected clients.
    const broadcast = (obj) => {
        const data = JSON.stringify(obj);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    };

    broadcast({ type: 'system', text: `${username} joined` });

    // Shouldn't ever be an issue, but hey. Essentially though controls what users see when a message is sent.
    socket.on('message', (message) => {
        let parsed;
        try {
            parsed = JSON.parse(message.toString());
        } catch {
            return socket.close(1003, 'Invalid JSON');
        }
        broadcast({
            type: 'chat',
            username,
            text: parsed.text,
        });
    });

    // On close informs all users of the disconnected users disembarking.
    socket.on('close', () => {
        broadcast({ type: 'system', text: `${username} left` });
    });
});

// Starts the server.
server.listen(PORT, () => {
    console.log(`Chat Server running at http://localhost:${PORT}`);
});
