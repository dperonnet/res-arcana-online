import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { DEFAULT_COMPONENT } from './EditorConstants';
import ComponentForm from './ComponentForm';
import DatabaseContent from './DatabaseContent';
import CardZoom from '../common/card/CardZoom.js';
import './editor.scss';
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

  renderActionCost = (action) => {
    return <>
      {action.cost.turn && <div className="icon turn-component-icon"></div>}
      {action.cost.turnDragon && <div className="icon turn-dragon-icon"></div>}
      {action.cost.turnCreature && <div className="icon turn-creature-icon"></div>}
      {action.cost.onComponent && <div className="icon on-component-icon"></div>}
    </>
  }

  renderActionGain = (action) => {
    return <>
      {action.gain.straightenComponent && <div className="icon straighten-component-icon"></div>}
      {action.gain.straightenSelf && <div className="icon straighten-self-icon"></div>}
      {action.gain.straightenCreature && <div className="icon straighten-creature-icon"></div>}
      {action.gain.onComponent && <div className="icon on-component-icon"></div>}
      {action.cost.onlyWhenTurned && <div class="action-text">(When this card is turned)</div>}
    </>
  }

  render() {
    const { auth, component, pristineComponent } = this.props;
    const jsonComponent = this.getJsonFromObject(component);
    
    if(!auth.uid) return <Redirect to='/signIn'/>

    let card;
    if (pristineComponent && pristineComponent.class) {
      try {
        const src = require('../../assets/image/components/' + pristineComponent.type + '/' + pristineComponent.class + '.jpg');
        card = <div className="card-zoom-frame">
          <CardZoom
            src={ src }
            alt={ pristineComponent.name ? pristineComponent.name : null } 
            />
        </div>
      } catch (err) {
        card = <div>No file found for {pristineComponent.class}.jpg</div>
      }
    }
    
    let actionPowers = component.actionPowerList && component.actionPowerList.map((action) => {
      let cost = this.renderActionCost(action)
      let gain = this.renderActionGain(action)
      return <div className="component-action">
          <div className="action-cost-part">{cost}</div>
          <div className="icon gain-icon"></div>
          <div className="action-gain-part">{gain}</div>
        </div>
    })

    let actions = <div class="col">
      {actionPowers}
    </div>

    return (
      <Container className="editor-container">
        <div className="editor">
          <div className="main-section">
            <Row className="flex-row">
              <Col xs="12" md="6" className="flex-col">
                <h2>Database Editor</h2>
                <DatabaseContent
                  onSelect={this.handleSelect}
                  onCreate={this.handleCreate}
                  onDelete={this.handleDelete}
                />
                <h2>Component settings</h2>
                <ComponentForm
                  onSave={this.handleSave}
                  onReset={this.handleReset}
                />
              </Col>
              <Col xs="12" md="6" className="flex-col">
                <h2>Component datas</h2>
                <pre className="form-panel scrollable">
                  {jsonComponent}
                </pre>
              </Col>
            </Row>
          </div>
          <div className="side-section">
            {card}
            {actions}
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
    filter: state.editor.filter,
    pristineComponent: state.editor.pristineComponent
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteComponent: () => dispatch(deleteComponent()),
    saveComponent: (component) => dispatch(saveComponent(component)),
    selectComponent: (component) => dispatch({type: 'SELECT_COMPONENT_TO_EDIT', component}),
    resetComponent: () => dispatch({type: 'RESET_COMPONENT'})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DatabaseEditor)