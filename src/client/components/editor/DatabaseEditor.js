import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { DEFAULT_COMPONENT } from './EditorConstants';
import ComponentForm from './ComponentForm';
import DatabaseContent from './DatabaseContent';
import Card from './Card.js';
import './editor.css';
import { connect } from 'react-redux';
import { deleteComponent, saveComponent } from '../../../store/actions/editorActions'

class DatabaseEditor extends Component {

  handleSelect = (event) => {
    const { components, selectComponent} = this.props;
    const { value } = event.target;
    const selectedComponent  =  JSON.parse(JSON.stringify(value !== '' && components[value] ? components[value] : DEFAULT_COMPONENT));
    selectComponent(selectedComponent);
  }

  handleCreate = () => {
    const { selectComponent} = this.props;
    const newComponent = JSON.parse(JSON.stringify(DEFAULT_COMPONENT));
    selectComponent(newComponent);
  }

  handleDelete = () => {
    const { deleteComponent } = this.props;
    deleteComponent();
  }

  handleSave = () => {
    const { component, saveComponent } = this.props;
    saveComponent(component);
  }

  handleReset = () => {
    this.props.resetComponent();
  }

  getJsonFromObject = object => JSON.stringify(object, undefined, 2)

  renderImage = (component) => {
    console.log('renderImage')
    if (component && component.class) {
      console.log('lets render', component.name)
      const source = require( '../../../../scans/low/'+component.type+'s/'+component.class+'.png');
      return (
        <Card src={source}
              alt={component.name}
              size="x-large" />
      )
    } 
    return null
  }

  render() {
    const { component } = this.props;
    const jsonComponent = this.getJsonFromObject(component);

    return (
      <Container className="editorContainer">
        <div className="editor">
          <Row>
            <Col>
              <Row>
                <Col>
                  <h2>Database Editor</h2>
                  <DatabaseContent
                    onSelect={this.handleSelect}
                    onCreate={this.handleCreate}
                    onDelete={this.handleDelete}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <h2>Component settings</h2>
                  <ComponentForm
                    onSave={this.handleSave}
                    onReset={this.handleReset}
                  />
                </Col>
              </Row>
            </Col>
            <Col>
              <h2>Component datas</h2>
              <pre className="formPanel">
                {jsonComponent}
              </pre>
              {this.renderImage(component)}
            </Col>
          </Row>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    components: state.firestore.data.components,
    component: state.editor.component
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteComponent: () => dispatch(deleteComponent()),
    saveComponent: (component) => dispatch(saveComponent(component)),
    selectComponent: (component) => dispatch({type: 'SELECT_COMPONENT', component}),
    resetComponent: () => dispatch({type: 'RESET_COMPONENT'})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DatabaseEditor)