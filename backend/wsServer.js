const WebSocket = require('ws');
const http = require('http');

// Tạo HTTP server
const server = http.createServer((req, res) => {
  // Thêm CORS headers cho GitHub Codespaces
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/ws') {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('WebSocket endpoint only - Use WSS connection');
  } else if (req.url === '/') {
    // Tạo một trang test đơn giản
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WebSocket Test</title>
      </head>
      <body>
        <h1>WebSocket Server Running</h1>
        <p>Connect to: wss://curly-space-bassoon-w6r54vwwjp9h5x-3001.app.github.dev/ws</p>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Enter message">
        <button onclick="sendMessage()">Send</button>
        
        <script>
          const ws = new WebSocket('wss://curly-space-bassoon-w6r54vwwjp9h5x-3001.app.github.dev/ws');
          
          ws.onopen = function() {
            document.getElementById('messages').innerHTML += '<p>Connected!</p>';
          };
          
          ws.onmessage = function(event) {
            document.getElementById('messages').innerHTML += '<p>Received: ' + event.data + '</p>';
          };
          
          ws.onclose = function() {
            document.getElementById('messages').innerHTML += '<p>Disconnected!</p>';
          };
          
          function sendMessage() {
            const input = document.getElementById('messageInput');
            ws.send(input.value);
            input.value = '';
          }
        </script>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Tạo WebSocket server với cấu hình CORS
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  // Cho phép kết nối từ mọi origin (cần thiết cho GitHub Codespaces)
  verifyClient: (info) => {
    return true; // Hoặc thêm logic kiểm tra origin cụ thể
  }
});

// Lắng nghe kết nối WebSocket
wss.on('connection', (ws, req) => {
  console.log('Client connected from:', req.headers.origin);

  // Gửi tin nhắn chào mừng
  ws.send('Welcome to WebSocket server!');

  // Xử lý tin nhắn từ client
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });

  // Xử lý khi client ngắt kết nối
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Xử lý lỗi
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Lắng nghe trên port 3001 với host 0.0.0.0 để cho phép kết nối từ bên ngoài
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`WebSocket endpoint: wss://curly-space-bassoon-w6r54vwwjp9h5x-3001.app.github.dev/ws`);
});