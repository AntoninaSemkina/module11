const chat = document.getElementById("chat");
const usersDiv = document.getElementById("users");
const messageInput = document.getElementById("messageInput");
const usernameInput = document.getElementById("usernameInput");
const joinChatButton = document.getElementById("joinChat");
let username = null;

const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
  console.log("Соединение установлено");
};

// Отправляем имя пользователя после нажатия "Войти в чат"
joinChatButton.addEventListener("click", () => {
  username = usernameInput.value.trim(); // Получаем имя пользователя
  if (username) {
    socket.send(
      JSON.stringify({
        type: "join",
        username,
      })
    );
    document.getElementById("usernameInput").style.display = "none"; // Скрываем поле ввода
    document.getElementById("joinChat").style.display = "none"; // Скрываем кнопку
  } else {
    alert("Введите имя!");
  }
});

socket.onopen = () => {
  console.log("Соединение установлено");
  socket.send(
    JSON.stringify({
      type: "join",
      username,
    })
  );
};

socket.onerror = (error) => {
  console.error("Ошибка WebSocket:", error);
};

// обработка принятых сообщений
socket.onmessage = (event) => {
  try {
    const messageData = JSON.parse(event.data);
    console.log("Получено сообщение от сервера:", messageData);

    if (messageData.type === "userList") {
      console.log("Обновление списка пользователей:", messageData.users);
      updateUserList(messageData.users);
    } else if (messageData.type === "message") {
      const alignment = messageData.username === username ? "sent" : "received";
      displayMessage(
        messageData.username,
        messageData.text,
        messageData.time,
        alignment
      );
    }
  } catch (error) {
    console.error("Ошибка при обработке сообщения:", error);
  }
};

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// отображение сообщений в чате
function displayMessage(username, text, time, alignment) {
  const message = document.createElement("div");
  message.classList.add("message", alignment);

  const timestamp = document.createElement("span");
  timestamp.classList.add("timestamp");
  timestamp.textContent = `[${time}]`;

  const user = document.createElement("span");
  user.classList.add("username");
  user.textContent = `${username}:`;

  const messageContent = document.createElement("span");
  messageContent.textContent = text;

  message.appendChild(user);
  message.appendChild(messageContent);
  message.appendChild(timestamp);
  chat.appendChild(message);

  chat.scrollTop = chat.scrollHeight;
}

// обновление пользователей
function updateUserList(users) {
  console.log("Содержимое до очистки:", usersDiv.innerHTML);
  usersDiv.innerHTML = "<strong>Подключенные пользователи:</strong><br>";
  users.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.textContent = user;
    usersDiv.appendChild(userElement);
  });
}

// отправка сообщений
function sendMessage() {
  const messageText = messageInput.value;
  if (messageText) {
    const messageData = {
      type: "message",
      username,
      text: messageText,
      time: new Date().toLocaleTimeString(),
    };
    socket.send(JSON.stringify(messageData));
    messageInput.value = "";
  }
}
