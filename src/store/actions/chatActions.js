import firebase from 'firebase/app'

export const sendMessage = (message, chatId) => {
  return (dispatch, getState) => {
    // make asynch call to database
    const firestore = firebase.firestore()
    const profile = getState().firebase.profile
    const creatorId = getState().firebase.auth.uid
    const newMessage = {
      creatorName: profile.login,
      creatorId: creatorId,
      createdAt: new Date(),
      content: message,
    }
    const threshold = chatId === 'mainChat' ? 120 : 1000

    const chatRef = firestore.collection('chats').doc(chatId)
    firestore
      .runTransaction(transaction => {
        return transaction.get(chatRef).then(chatDoc => {
          let messages = chatDoc.data().messages
          if (messages) {
            if (messages.length > threshold) {
              for (let i = 0; i <= 1; i++) {
                transaction.update(chatRef, {
                  messages: firebase.firestore.FieldValue.arrayRemove(messages[i]),
                })
              }
            }
            transaction.update(chatRef, {
              messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
            })
          } else {
            messages = [newMessage]
            transaction.update(chatRef, { messages })
          }
        })
      })
      .then(() => {
        dispatch({ type: 'SEND_MESSAGE', message })
      })
      .catch(err => {
        dispatch({ type: 'SEND_MESSAGE_ERROR', err })
      })
  }
}

export const createChat = (chatId, chatName) => {
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const creatorId = getState().firebase.auth.uid
    firestore
      .collection('chats')
      .doc(chatId)
      .set({
        name: chatName,
        creatorId: creatorId,
        createdAt: new Date(),
      })
      .then(chat => {
        dispatch({ type: 'CREATE_CHAT', chat })
      })
      .catch(err => {
        dispatch({ type: 'CREATE_CHAT_ERROR', err })
      })
  }
}

export const deleteChat = chatId => {
  return () => {
    const firestore = firebase.firestore()
    console.log('call to deleteChat', chatId)
    firestore
      .collection('chats')
      .doc(chatId)
      .delete()
  }
}

export const toggleChat = () => {
  return {
    type: 'TOGGLE_CHAT',
  }
}
