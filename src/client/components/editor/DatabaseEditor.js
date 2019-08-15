import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { DEFAULT_COMPONENT } from './EditorConstants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlash } from '@fortawesome/free-solid-svg-icons';
import ComponentForm from './ComponentForm';
import DatabaseContent from './DatabaseContent';
import CardZoom from '../common/card/CardZoom.js';
import './editor.scss';
import { connect } from 'react-redux';
import { deleteComponent, saveComponent } from '../../../store/actions/editorActions'

const COMPONENTS_STYLES = {
  artefact: 'card',
  backArtefact: 'card',
  backMonument: 'card',
  backMage: 'card',
  mage: 'card', 
  magicItem: 'magic-item',
  monument: 'card',
  placeOfPower: 'place-of-power'
}

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
        {plus && !isLast && <div className="operator mt-n2 mr-0 ml-0">+</div>}
        {slash && !isLast && <div className="operator mt-n2">
          <FontAwesomeIcon icon={faSlash} size="xs" rotation={80} />
        </div>}
      </div>
    })
  }
  renderCostEssenceList = (essenceList, slash) => {
    return this.renderEssenceList(essenceList, true, slash, !slash)
  }
  
  renderGainEssenceList = (essenceList, modifier) => {
     return this.renderEssenceList(essenceList, false, false, true, modifier)
  }
  
  renderActionCost = (action) => {
    let essencePrefix = action.cost.essenceList && Object.keys(action.cost).filter((key) => key.startsWith('turn')).length > 0
    let essences = this.renderCostEssenceList(action.cost.essenceList, action.cost.multipleCostOptions)

    return <>
      {action.cost.turn && <div className="icon turn-component-icon"></div>}
      {action.cost.turnDragon && <>
        {action.cost.turn && <>+</>}
        <div className="icon turn-dragon-icon ml-1"></div>
      </>}
      {action.cost.turnCreature && <>
        {action.cost.turn && <>+</>}
        <div className="icon turn-creature-icon ml-1"></div>
      </>}
      {essencePrefix && <>+</>}{essences}
      {action.cost.onComponent && <><div class="action-text">on</div><div className="icon on-component-icon"></div></>}
      {action.cost.sameType && <>+ <div className="essence sm any-same-type"><div className="cost"></div></div></>}
      {action.cost.destroySelf && <>
        <div class="action-text">Destroy</div>
        <div className="icon on-component-icon"></div>
      </>}
      {action.cost.destroyOneArtefact && <>+
        <div class="action-text max-85">destroy <i>any one</i> of your artifacts</div>
      </>}
      {action.cost.destroyAnotherArtefact && <>+
        <div class="action-text max-85">destroy <i>another</i> of your artifacts</div>
      </>}
      {action.cost.destroyOneDragonOrCreature && <>+
        <div class="action-text">destroy one of your <i>dragons</i> or <i>creatures</i></div>
      </>}
      {action.cost.discardArtefact && <>
        +<div class="action-text max-60">discard a card</div>
      </>}
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
      {action.gain.checkVictoryNow && <div class="action-text">check vitory now!</div>}
      {action.gain.drawOne && <div class="action-text">draw <span className="large">1</span> card</div>}
      {action.gain.drawThreeDiscardThree && <div class="action-text max-125">draw <span className="large">3</span> cards, add to hand, discard <span className="large">3</span></div>}
      {action.gain.reorderThree > 0 && <div class="action-text">draw <span className="large">3</span> cards, reorder, put back <i>(may also use on Monument deck)</i></div>}
      {action.gain.onComponent && <><div class="action-text mr-1">on</div><div className="icon on-component-icon"></div></>}
      {action.cost.onlyWhenTurned && <div class="action-text max-95">(When this card is turned)</div>}
      {action.gain.putItOnAnyComponent && <><div class="action-text max-60">put the essence spent on</div><div className="icon component-icon"></div></>}
      {action.gain.putItOnComponent && <><div class="action-text">put it on</div><div className="icon on-component-icon"></div></>}
      {action.gain.placeArtefactFromDiscard && <>
        <div class="action-text max-75">place one of <i>your</i> discards at</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
        {modifierList}
      </>}
      {action.gain.powerCostAsGold && <div className="icon essence sm gold"><div className="qm"></div></div>}
      {action.gain.powerCostAsAnySameTypeButGold && <div className="essence sm any-same-type-but-gold"></div>}
      {action.gain.placementCostAsGold && <>
        <div class="action-text">gain</div>
        <div className="icon placement-cost-icon max-95"><div className="qm-dark"></div></div>
        <div class="action-text">in</div>
        <div className="essence gold"></div>
        </>}
      {action.gain.placementCostAsAnyButGold && <>
        <div class="action-text">gain</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
        <div class="action-text">in</div>
        {modifierList}
      </>}
      {action.gain.placeDragonForFree && <>
        <div class="action-text mr-1">Place</div>
        <div className="icon dragon-icon"></div>
        <div class="action-text ml-1 mr-1">at</div>
        <div className="icon placement-cost-icon"><div className="zero">0</div></div>
      </>}
      {action.gain.placeDragon && <>
        <div class="action-text mr-1">Place</div>
        <div className="icon dragon-icon"></div>
        <div class="action-text ml-1 mr-1">at</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
        {modifierList}
      </>}
      {action.gain.asManyCalmThanRivalsElan && <>
        <div class="action-text">Gain</div>
        <div className="essence sm calm"><div className="qm"></div></div>
        <div class="action-text">equal to</div>
        <div className="essence sm elan"><div className="qm"></div></div>
        <div class="action-text">of one rival</div>
      </>}
      {action.gain.asManyElanThanRivalsDeath && <>
        <div class="action-text">Gain</div>
        <div className="essence sm elan"><div className="qm"></div></div>
        <div class="action-text">equal to</div>
        <div className="essence sm death"><div className="qm"></div></div>
        <div class="action-text">of one rival</div>
      </>}
      {action.gain.placeDragonFromAnyDiscardPile && <>
        <div class="action-text">Place</div>
        <div className="icon dragon-icon"></div>
        <div class="action-text max-95">from <i>any</i> player's discard pile at</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
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
        card = <div className={'card-zoom-frame ' + COMPONENTS_STYLES[component.type]}>
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
      let color = component.type === 'placeOfPower' ? ' place-of-power-action': ''
      return <div className={'component-action position-'+index + color}>
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
          <div className="action-renderer">
            {actions}
          </div>
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