const io = require('./server.js').io;

const { COMMUNITY_CHAT, LOGOUT, MESSAGE_RECIEVED, MESSAGE_SENT,
  TYPING, USER_CONNECTED, USER_DISCONNECTED, VERIFY_USER } = require('./Events');

const { createChat, createMessage, createUser } = require('./Factories');

let connectedUsers = { };

let communityChat = createChat();

module.exports = function(socket) {
  //console.log('\x1bc'); // clears console
  //console.log("Socket Id:" + socket.id);

	let sendMessageToChatFromUser;
	let sendTypingFromUser;

  socket.on(VERIFY_USER, (nickname, callback)=>{
    if(isUser(connectedUsers, nickname)){
      callback({isUser:true, user:null});
    }else{
      callback({isUser:false, user:createUser({name:nickname})});
    }
  });

  socket.on(USER_CONNECTED, (user)=>{
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;

		sendMessageToChatFromUser = sendMessageToChat(user.name);
		sendTypingFromUser = sendTypingToChat(user.name);

    io.emit(USER_CONNECTED, connectedUsers);
    console.log(connectedUsers);
  });

  socket.on('disconnect', ()=>{
    if("user" in socket){
      connectedUsers = removeUser(connectedUsers, socket.user.name);
      io.emit(USER_DISCONNECTED, connectedUsers);
      console.log("User %s disconnected",socket.user.name);
    }
  });

  socket.on(LOGOUT, ()=>{
    connectedUsers = removeUser(connectedUsers, socket.user.name);
    io.emit(USER_DISCONNECTED, connectedUsers);
    console.log("User %s Logged out", socket.user.name);
  });

  socket.on(COMMUNITY_CHAT, (callback)=>{
    callback(communityChat);
  });

	socket.on(MESSAGE_SENT, ({chatId, message})=>{
		sendMessageToChatFromUser(chatId, message);
	});

	socket.on(TYPING, ({chatId, isTyping})=>{
		sendTypingFromUser(chatId, isTyping);
	});

}

function sendTypingToChat(user){
	return (chatId, isTyping)=>{
		io.emit(`${TYPING}-${chatId}`, {user, isTyping})
	}
}

function sendMessageToChat(sender){
	return (chatId, message)=>{
		io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({message, sender}))
	}
}

function addUser(userList, user){
    let newList = Object.assign({}, userList);
    newList[user.name] = user
    return newList
}

function removeUser(userList, username){
  let newList = Object.assign({}, userList);
  delete newList[username]
  return newList
}

function isUser(userList, username){
  return username in userList
}
