import React, { Component } from 'react'
import { Button, ButtonToolbar, Form} from 'react-bootstrap'
import { COMPONENTS_TYPE } from './EditorConstants.js'
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';

class DatabaseContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedComponentId: ''
    }
  }

  handleFilter = (event) => {
    const { filterComponents } = this.props
    const { value } = event.target;
    filterComponents(value);
  }

  handleSelect = (event) => {
    this.setState({selectedComponentId: event.target.value})
    this.props.onSelect(event);
  }

  handleCreate = () => {
    this.setState({selectedComponentId: ''})
    this.props.onCreate()
  }

  handleDelete = () => {
    this.props.onDelete();
  }

  render() {
    const { component, components, filter } = this.props;
    const options = components && Object.entries(components).filter((component) => {
      return component[1].type === filter
    }).map((component) => {
      return (
        <option key={component[0]} value={component[1].id}>
          {component[1].name}
        </option>
      )
    })
    const componentsType = JSON.parse(JSON.stringify(COMPONENTS_TYPE));
    
    if (!isLoaded(components)) {
      return <div className="loading">Loading...</div> 
    }
    
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

          <Form.Control size="sm" as="select" 
            name="currentComponent" value={component.id} 
            onChange={(event) => this.handleSelect(event)}
          >
            <option value="" className="disabled" defaultValue>--- new component ---</option>
            {options}
          </Form.Control>
        </Form.Group>
        <ButtonToolbar>
          <Button variant="secondary" size="sm" onClick={this.handleCreate}>Create</Button>
          <Button variant="secondary" size="sm" onClick={this.handleDelete}>Delete</Button>
        </ButtonToolbar>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    components: state.firestore.ordered.components,
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