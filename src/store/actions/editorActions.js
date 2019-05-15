export const saveComponent = (component) => {
  return (dispatch, getState, {getFirestore}) => {
    console.log('save component',component)
    const firestore = getFirestore();
    firestore.collection('components').doc(component.componentName).set(component)
      .then((componentRef) => {
        dispatch({type: 'SAVE_COMPONENT', componentRef})
      }).catch((err) => {
        dispatch({type: 'SAVE_COMPONENT_ERROR', err})
      });
  }
}

export const deleteComponent = (component) => {
  return (dispatch, getState, {getFirestore}) => {
    
  }
}