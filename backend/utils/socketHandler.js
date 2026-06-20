const { Chat } = require('../models/index');

module.exports = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });

    socket.on('chat:join', (chatId) => {
      socket.join(chatId);
    });

    socket.on('chat:message', async ({ chatId, senderId, content, type = 'text' }) => {
      try {
        const chat = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: { messages: { sender: senderId, content, type } },
            lastMessage: content,
            lastActivity: new Date(),
          },
          { new: true }
        ).populate('messages.sender', 'name avatar');

        const lastMsg = chat.messages[chat.messages.length - 1];
        io.to(chatId).emit('chat:newMessage', { chatId, message: lastMsg });

        // Notify the other participant
        chat.participants.forEach((p) => {
          if (p.toString() !== senderId) {
            const recipientSocketId = onlineUsers.get(p.toString());
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('notification:new', {
                title: 'New Message',
                message: content.slice(0, 50),
                type: 'chat',
              });
            }
          }
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', ({ chatId, userId, isTyping }) => {
      socket.to(chatId).emit('chat:typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) { onlineUsers.delete(userId); break; }
      }
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });
};
