const uuidv4 = require('uuid/v4');

const createUser = ({name = "", socketId = null} = { })=>(
  {
    id:uuidv4(),
    name,
    socketId
  }
);

const createMessage = ({message = "", sender =""} = { })=>(
  {
    id:uuidv4(),
    time:getTime(new Date(Date.now())),
    message,
    sender
  }
);

const createChat = ({messages = [], name = "Community", users = [], isCommunity = false} = {})=>(
  {
		id:uuidv4(),
		name: isCommunity ? name : createChatNameFromUsers(users),
		messages,
		users,
		typingUsers:[],
		isCommunity
  }
);

const createChatNameFromUsers = (users, excludedUser = "") => {
	return users.filter(u => u !== excludedUser).join(' & ') || "Empty Chat"
};

const getTime = (date)=>{
	return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`;
};

module.exports = {
  createChat,
  createMessage,
  createUser,
  createChatNameFromUsers
};
