export const saveComponent = component => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
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
  return (dispatch, getState, { getFirestore }) => {
    const component = getState().editor.component
    const firestore = getFirestore()
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
