import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { DEFAULT_COMPONENT } from './EditorConstants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSlash } from '@fortawesome/free-solid-svg-icons';
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

  renderEssenceList = (essenceList, cost, slash, plus, modifier) => {
    return essenceList && essenceList.map((essence, index) => {
      let classModifier = modifier && essence && essence.quantity ? ' modifier' : ''
      let signModifier = modifier && essence && essence.quantity > 0 ? '+' : ''
      let isLast = index === essenceList.length -1
      return <div key={essence.type} className={'icons '}>
        <div className={'essence sm ' + essence.type + classModifier}>
        {cost && <div className="cost"></div>}
        {signModifier}{(essence.quantity > 1) || (essence.quantity < 0) ? essence.quantity : ''}</div>
        {plus && !isLast && <div className="operator mt-n2">+</div>}
        {slash && !isLast && <div className="operator mt-n2">
          <FontAwesomeIcon icon={faSlash} size="xs" rotation={80} />
        </div>}
      </div>
    })
  }
  renderCostEssenceList = (essenceList, slash) => {
    return this.renderEssenceList(essenceList, true, slash, false)
  }
  
  renderGainEssenceList = (essenceList, modifier) => {
     return this.renderEssenceList(essenceList, false, false, true, modifier)
  }
  
  renderActionCost = (action) => {
    let essencePrefix = action.cost.essenceList && Object.keys(action.cost).filter((key) => key.startsWith('turn')).length > 0
    let essences = this.renderCostEssenceList(action.cost.essenceList, action.cost.multipleCostOptions)

    return <>
      {action.cost.turn && <div className="icon turn-component-icon"></div>}
      {action.cost.turnDragon && <div className="icon turn-dragon-icon"></div>}
      {action.cost.turnCreature && <div className="icon turn-creature-icon"></div>}
      {essencePrefix && <>+</>}{essences}
      {action.cost.onComponent && <><div class="action-text mr-1">on</div><div className="icon on-component-icon"></div></>}
      {action.cost.sameType && <>+ <div className="essence sm any-same-type"><div className="cost"></div></div></>}
    </>
  }

  renderActionGain = (action) => {
    let essences = this.renderGainEssenceList(action.gain.essenceList)
    let rivalsGainPrefix = action.gain.rivalsGain
    let rivalsGainEssences = this.renderGainEssenceList(action.gain.rivalsGainEssenceList)
    let modifierList = this.renderGainEssenceList(action.gain.modifierList, true)

    return <>
      {action.gain.straightenComponent && <div className="icon straighten-component-icon"></div>}
      {action.gain.straightenSelf && <div className="icon straighten-self-icon"></div>}
      {action.gain.straightenCreature && <div className="icon straighten-creature-icon"></div>}
      {essences}
      {rivalsGainPrefix && <div class="action-text">+ all rivals gain</div>}{rivalsGainEssences}
      {action.gain.rivalsLoseLife > 0 && <>
        <div class="action-text">all rivals</div>
        <div className="icon essence sm life-loss">{action.gain.rivalsLoseLife > 1 ? action.gain.rivalsLoseLife : ''}</div>
      </>}
      {action.gain.powerCostAsGold && <div className="icon essence sm gold"><div className="qm"></div></div>}
      {action.gain.drawOne > 0 && <div class="action-text">draw 1 card</div>}
      {action.gain.onComponent && <><div class="action-text mr-1">on</div><div className="icon on-component-icon"></div></>}
      {action.cost.onlyWhenTurned && <div class="action-text">(When this card is turned)</div>}
      {action.gain.putItOnAnyComponent && <><div class="action-text max-60">put the essence spent on</div><div className="icon component-icon"></div></>}
      {action.gain.putItOnComponent && <><div class="action-text">put it on</div><div className="icon on-component-icon"></div></>}
      {action.gain.asManyCalmThanRivalsElan && <>
        <div class="action-text">Gain</div>
        <div className="essence sm calm"><div className="qm"></div></div>
        <div class="action-text">equal to</div>
        <div className="essence sm elan"><div className="qm"></div></div>
        <div class="action-text">of one rival</div>
      </>}
      {action.gain.placeArtefactFromDiscard && <>
        <div class="action-text max-75">place one of your discards at</div>
        <div className="icon placement-cost-icon"></div>
        {modifierList}
      </>}
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
    
    let actions = component.actionPowerList && component.actionPowerList.map((action, index) => {
      let cost = this.renderActionCost(action)
      let gain = this.renderActionGain(action)
      return <div className={'component-action position-'+index}>
          <div className="action-cost-part">{cost}</div>
          <div className="icon gain-icon"></div>
          <div className="action-gain-part">{gain}</div>
        </div>
    })

    return <Container className="editor-container">
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