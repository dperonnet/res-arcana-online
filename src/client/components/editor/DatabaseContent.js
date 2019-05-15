import React, { Component } from 'react'
import { Button, ButtonToolbar, Form} from 'react-bootstrap'
import { COMPONENTS_TYPE } from './EditorConstants.js'
import './Form.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';

class DatabaseContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedComponentId: 'default'
    }
  }

  handleFilter = (e) => {
    const { filterComponents } = this.props
    const { value } = e.target;
    filterComponents(value);
  }

  handleSelect = (event) => {
    this.setState({selectedComponentId: event.target.value})
    this.props.onSelect(event);
  }

  render() {
    const { component, components, filter, onCreate } = this.props;
    const { selectedComponentId } = this.state;
    const options = components && Object.entries(components).map((component) => {
      return (
        <option key={component[0]} value={component[1].id}>
          {component[1].componentName}
        </option>
      )
    })
    const componentsType = JSON.parse(JSON.stringify(COMPONENTS_TYPE));
    
    if (!isLoaded(components)) {
      return <div className="loading">Loading...</div> 
    }
    console.log('props.components',this.props.components)
    
    return (
      <div className="formPanel">
        <Form.Group controlId="gameComponentsForm">
          <Form.Label>Game Components</Form.Label>
          
          <div className="mb-3">
            {componentsType.map((type) => (
              <Form.Check inline type="radio" name="componentsType"
                key={type.id} id={type.id} value={type.id} label={type.name}
                checked={filter === type.id}
                onChange={this.handleFilter}
              />
            ))}
          </div>

          <Form.Control as="select" name="currentComponent" value={component.id} onChange={(e) => this.handleSelect(e)}
            className={selectedComponentId === 'default' ? 'disabled' : ''}>
            <option value="default" className="disabled">--- new component ---</option>
            {options}
          </Form.Control>
        </Form.Group>
        <ButtonToolbar>
          <Button variant="secondary" size="sm" onClick={onCreate}>Create</Button>
          <Button variant="secondary" size="sm" onClick={this.handleDelete}>Delete</Button>
        </ButtonToolbar>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    components: state.firestore.data.components,
    component: state.editor.component,
    filter: state.editor.filter
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    filterComponents: (filter) => dispatch({type: 'FILTER_COMPONENTS', filter})
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect(() => [
    { collection: 'components' }
  ])
)(DatabaseContent)