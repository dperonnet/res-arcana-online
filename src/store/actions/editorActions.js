import firebase from 'firebase/app'

export const saveComponent = component => {
  return dispatch => {
    const firestore = firebase.firestore()

    firestore
      .collection('components')
      .doc(component.id)
      .set(component)
      .then(() => {
        dispatch({ type: 'SAVE_COMPONENT', component })
      })
      .catch(err => {
        dispatch({ type: 'SAVE_COMPONENT_ERROR', err })
      })
  }
}

export const deleteComponent = () => {
  return (dispatch, getState) => {
    const component = getState().editor.component
    const firestore = firebase.firestore()
    const componentId = component.id
    firestore
      .collection('components')
      .doc(component.id)
      .delete()
      .then(() => {
        dispatch({ type: 'DELETE_COMPONENT', componentId })
      })
      .catch(err => {
        dispatch({ type: 'DELETE_COMPONENT_ERROR', err })
      })
  }
}
