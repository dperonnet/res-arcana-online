import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { DEFAULT_COMPONENT } from './EditorConstants';
import ComponentForm from './ComponentForm';
import DatabaseContent from './DatabaseContent';
import CardZoom from '../common/card/CardZoom.js';
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

  render() {
    const { auth, component, pristineComponent } = this.props;
    const jsonComponent = this.getJsonFromObject(component);
    
    if(!auth.uid) return <Redirect to='/signIn'/>

    let card;
    if (pristineComponent && pristineComponent.class) {
      try {
        const sourcePath = '../../../../scans/low/' + pristineComponent.type + '/' + pristineComponent.class + '.png';
        console.log('sourcePath', sourcePath);
        const src = require('../../../../scans/low/' + pristineComponent.type + '/' + pristineComponent.class + '.png');
        card = <div className="card-zoom-frame">
          <CardZoom
            src={ src }
            show={ true } 
            alt={ pristineComponent.name ? pristineComponent.name : null } 
            />
        </div>
      } catch (err) {
        card = <div>No file found for {pristineComponent.class}.png</div>
      }
    } 

    return (
      <Container className="editorContainer">
        <div className="editor">
          <div className="mainSection">
            <Row className="flex-row">
              <Col xs="12" md="6" className="flex-col">
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
                <Row className="flex-grow">
                  <Col className="flex-col">
                    <h2>Component settings</h2>
                    <ComponentForm
                      onSave={this.handleSave}
                      onReset={this.handleReset}
                      />
                  </Col>
                </Row>
              </Col>
              <Col xs="12" md="6" className="flex-col">
                <Row className="flex-grow">
                  <Col className="flex-col">
                    <h2>Component datas</h2>
                    <pre className="formPanel flex-grow">
                      {jsonComponent}
                    </pre>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <div className="sideSection">
            {card}
            {/*<Chat
                visible={ this.state.showChat }
                messages={ this.props.currentGame.messages }
                onMouseOver={ this.onMouseOver }
                onMouseOut={ this.onMouseOut }
                sendMessage={ this.sendMessage }
            />
            <Controls
                onSettingsClick={ this.onSettingsClick }
                onManualModeClick={ this.onManualModeClick }
                onToggleChatClick={ this.onToggleChatClick }
                showChatAlert={ this.state.showChatAlert }
                manualModeEnabled={ manualMode }
                showManualMode={ !this.state.spectating }
            />*/}
          </div>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    components: state.firestore.data.components,
    component: state.editor.component,
    pristineComponent: state.editor.pristineComponent
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