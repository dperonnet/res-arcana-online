export const sendMessage = (message, chatId) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    // make asynch call to database
    const fireStore = getFirestore();
    const profile = getState().firebase.profile;
    const creatorId = getState().firebase.auth.uid;
    const newMessage = {
        creatorName: profile.login,
        creatorId: creatorId,
        createdAt: new Date(),
        content: message
    }

    console.log('sendMessage : ', newMessage)

    fireStore.collection('chats').doc(chatId).update({
      messages: fireStore.FieldValue.arrayUnion(newMessage)
    }).then(() => {
      dispatch({ type: 'SEND_MESSAGE', message});
    }).catch((err) => {
      dispatch({type: 'SEND_MESSAGE_ERROR', err});
    })
  }
};

export const createChat = (chatId, chatName) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const fireStore = getFirestore();
    const creatorId = getState().firebase.auth.uid
    fireStore.collection('chats').doc(chatId).set({
      name: chatName,
      creatorId: creatorId,
      createdAt: new Date()
    }).then((chat) => {
      dispatch({ type: 'CREATE_CHAT', chat});
    }).catch((err) => {
      dispatch({type: 'CREATE_CHAT_ERROR', err});
    })
  }
}

export const deleteChat = (chatId) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const fireStore = getFirestore();
    console.log('call to deleteChat',chatId)
    fireStore.collection('chats').doc(chatId).delete()
  }
}