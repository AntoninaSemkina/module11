const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });
let users = [];

server.on("connection", (socket) => {
  console.log("Новое подключение");

  socket.on("message", (message) => {
    const messageData = JSON.parse(message.toString());

    // подключение пользователя
    if (messageData.type === "join") {
      if (messageData.username && !users.includes(messageData.username)) {
        socket.username = messageData.username;
        users.push(messageData.username);
        console.log("Пользователь подключился:", messageData.username);
        console.log("Текущие пользователи:", users);
        broadcastUserList();
      }
    }

    // обработка полученного сообщения
    if (messageData.type === "message") {
      console.log("Получено сообщение от клиента:", messageData);

      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "message",
              username: socket.username || messageData.username,
              text: messageData.text,
              time: messageData.time,
            })
          );
        }
      });
    }
  });

  // отключение клиента
  socket.on("close", () => {
    if (socket.username) {
      users = users.filter((user) => user !== socket.username); //  удалить пользователя из списка активных
      console.log(`Клиент отключился: ${socket.username}`);
      console.log("Текущие пользователи после отключения:", users);
      broadcastUserList();
    }
  });

  function broadcastUserList() {
    const userListMessage = JSON.stringify({
      type: "userList",
      users,
    });
    console.log("Рассылка списка пользователей:", users);
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(userListMessage);
      }
    });
  }
});

console.log("WebSocket сервер запущен на порту 8080");
