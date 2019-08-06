import React, { Component, useEffect, useState } from 'react'
import { Button, ButtonToolbar, Form, InputGroup} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { COMPONENTS_TYPE, DEFAULT_COMPONENT, DISCOUNT, REACT_POWER, SPECIFIC_COLLECT_ABILITY, STANDARD_COLLECT_ABILITY } from './EditorConstants'
import { connect } from 'react-redux'
import { deleteComponent, saveComponent } from '../../../store/actions/editorActions'

class ComponentForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      component: this.getDefaultComponent()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.componentDidChange !== this.props.componentDidChange) {
      this.setState({
        component: this.getDefaultComponent()
      })
    }
  }

  getDefaultComponent = () => {
    const { pristineComponent } = this.props
    const component = Object.keys(pristineComponent).length !== 0 ?
      pristineComponent : DEFAULT_COMPONENT
    return copy(component)
  }

  handleReset = () => {
    this.setState({ component: this.getDefaultComponent()})
    this.props.onReset()
  }

  handleFormChange = (changeEvent) => {
    const { checked, name, value, type } = changeEvent.target
    const { component } = this.state
    const valueToUpdate = type === 'checkbox' ? checked : value
    let newComponent

    // delete or initialize datas depending on the changed field
    switch (name) {
      case 'hasCost':
        if (valueToUpdate === true) {
          component.costEssenceList = []
        } else {
          delete component.costEssenceList
        }
        break
      case 'hasStandardCollectAbility':
        if (valueToUpdate === true) {
          component.standardCollectAbility = copy(STANDARD_COLLECT_ABILITY)
        } else {
          delete component.standardCollectAbility
        }
        break
      case 'hasSpecificCollectAbility':
        if (valueToUpdate === true) {
          const newSCA = copy(SPECIFIC_COLLECT_ABILITY)
          component.specificCollectAbility = newSCA
        } else {
          delete component.specificCollectAbility
        }
        break
      case 'hasDiscountAbility':
        if (valueToUpdate === true) {
          component.discountAbilityList = []
        } else {
          delete component.discountAbilityList
        }
        break
      case 'hasActionPower':
        if (valueToUpdate === true) {
          component.actionPowerList = []
        } else {
          delete component.actionPowerList
        }
        break
      case 'hasPlacementPower':
        if (valueToUpdate === true) {
          component.placementPowerList = []
        } else {
          delete component.placementPowerList
        }
        break
      case 'hasReactPower':
        if (valueToUpdate === true) {
          component.reactPowerList = []
        } else {
          delete component.reactPowerList
        }
        break
      case 'hasVictoryPoint':
        if (valueToUpdate === true) {
          component.victoryPoint = 1
        } else {
          delete component.victoryPoint
        }
        break
      case 'hasConditionalVictoryPoint':
        if (valueToUpdate === true) {
          component.conditionalVictoryPointList = []
        } else {
          delete component.conditionalVictoryPointList
        }
        break
      case 'type':
        if (valueToUpdate === 'mage') {
          component.hasAlternative = false
          component.isAlternative = false
        } else {
          delete component.hasAlternative
          delete component.isAlternative
        }
        if (valueToUpdate === 'mage' || valueToUpdate === 'magicItem') {
          delete component.hasCost
          delete component.costEssenceList
        } else {
          component.hasCost = component.hasCost ? component.hasCost : false
        }
        if (valueToUpdate !== 'artefact') {
          delete component.isDragon
          delete component.isCreature
        } else {
          component.isDragon = false
          component.isCreature = false
        }
        if (valueToUpdate === 'placeOfPower') {
          component.hasConditionalVictoryPoint = false
          component.excludedComponentId = ""
        } else {
          delete component.hasConditionalVictoryPoint
          delete component.excludedComponentId
        }
        break
      default:
    }

    if (name === 'multipleCollectOptions') {
      newComponent = component
      newComponent.specificCollectAbility.multipleCollectOptions = valueToUpdate
    } else {
      newComponent = {
        ...component,
        [name]: valueToUpdate
      }
    }

    this.setState({component: newComponent})
    this.props.showComponentJSON(newComponent)
  }

  handleFormChangeByName = (name, valueToUpdate) => {
    const { component } = this.state
    let newComponent
    if (name === 'standardCollectAbility') {
      newComponent = component
      newComponent.standardCollectAbility.essenceList= valueToUpdate
    } else if (name === 'specificCollectAbility') {
      newComponent = component
      newComponent.specificCollectAbility.essenceList= valueToUpdate
    } else {
      newComponent = {
        ...component,
        [name]: valueToUpdate
      }
    }
    this.setState({component: newComponent})
    this.props.showComponentJSON(newComponent)
  }

  decrement = (name) => {
    let property = this.state.component[name.toString()]
    this.handleFormChangeByName(name, property - 1)
  }

  increment = (name) => {
    let property = this.state.component[name]
    this.handleFormChangeByName(name, property + 1)
  }

  clearCollectOptions = (name) => {
    this.handleFormChangeByName(name, [])
  }

  render() {
    const { onSave } = this.props
    const { component } = this.state
    const componentsType = JSON.parse(JSON.stringify(COMPONENTS_TYPE))

    return (
      <div className="form-panel flex-grow">
        {component && 
          <form onSubmit={onSave}>
            <Form.Group controlId="ComponentSettingsForm">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Prepend>
                  <InputGroup.Text id="name">Name</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  placeholder="Component name"
                  name="name"
                  value={component.name}
                  onChange={this.handleFormChange}
                />
              </InputGroup>

              <div className="mb-2">
                {componentsType.map((type) => (
                  <Form.Check inline type="radio" name="type"
                    key={'editor'+type.id} id={'editor'+type.id} value={type.id} label={type.name}
                    checked={component.type === type.id}
                    onChange={this.handleFormChange}
                  />
                ))}
              </div>

              {component.type === 'placeOfPower' &&
                <InputGroup size="sm" className="mb-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="name">Excluded component id</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    placeholder="excludedComponentId"
                    name="excludedComponentId"
                    value={component.excludedComponentId}
                    onChange={this.handleFormChange}
                  />
                </InputGroup>
              }

              { component.type !== 'mage' && component.type !== 'magicItem' &&
                <>
                  <InputGroup className="mb-2">
                    <Form.Check inline type="checkbox" name="hasCost"
                      id="hasCost" label="Has cost"
                      value={component.hasCost}
                      checked={component.hasCost}
                      onChange={this.handleFormChange}/>
                    
                      <Button variant="secondary" id={'clearCost'} size="sm" className={component.hasCost ? '' : 'd-none'}
                        onClick={(e) => this.clearCollectOptions('costEssenceList')}><span>Reset</span></Button>
                  </InputGroup>

                  { component.hasCost && 
                    <>
                      <div className="mb-2">
                        <EssencePanel
                          essenceList={component.costEssenceList}
                          onChange={(data) => this.handleFormChangeByName('costEssenceList', data)}
                        />
                      </div>
                    </>
                  }
                </>
              }

              <InputGroup className="mb-2">
                <Form.Check inline type="checkbox" name="hasStandardCollectAbility"
                  id="hasStandardCollectAbility" label="Has standard collect ability"
                  value={component.hasStandardCollectAbility}
                  checked={component.hasStandardCollectAbility}
                  onChange={this.handleFormChange}/>
                
                  <Button variant="secondary" id={'clearCollectOptions'} size="sm" className={component.hasStandardCollectAbility ? '' : 'd-none'}
                    onClick={(e) => this.clearCollectOptions('standardCollectAbility')}><span>Reset</span></Button>
              </InputGroup>

              { component.hasStandardCollectAbility && 
                <>
                  <div className="mb-2">
                    <EssencePanel
                      essenceList={component.standardCollectAbility && component.standardCollectAbility.essenceList}
                      onChange={(data) => this.handleFormChangeByName('standardCollectAbility', data)}
                    />
                  </div>
                </>
              }

              <InputGroup className="mb-2">
                <Form.Check inline type="checkbox" name="hasSpecificCollectAbility"
                  id="hasSpecificCollectAbility" label="Has specific collect ability"
                  value={component.hasSpecificCollectAbility}
                  checked={component.hasSpecificCollectAbility}
                  onChange={this.handleFormChange}/>

                  <Button variant="secondary" id={'clearCollectOptions'} size="sm" className={component.hasSpecificCollectAbility ? '' : 'd-none'}
                    onClick={(e) => this.clearCollectOptions('specificCollectAbility')}><span>Reset</span></Button>
              </InputGroup>

              { component.hasSpecificCollectAbility && 
                <>
                  <div className="mb-2">
                    <EssencePanel
                      essenceList={component.specificCollectAbility && component.specificCollectAbility.essenceList}
                      onChange={(data) => this.handleFormChangeByName('specificCollectAbility', data)}
                    />
                  </div>
                  <div className="mb-2">
                    <InputGroup className="mb-2">
                      <Form.Check inline type="checkbox" name="multipleCollectOptions"
                        id="multipleCollectOptions" label="Player can choose different essences"
                        value={component.specificCollectAbility.multipleCollectOptions}
                        checked={component.specificCollectAbility.multipleCollectOptions}
                        onChange={this.handleFormChange}/>
                    </InputGroup>
                  </div>
                </>
              }
              
              <DiscountPanel 
                component={component}
                onChange={(data) => this.handleFormChange(data)}
                onChangeByName={(name, data) => this.handleFormChangeByName(name, data)}
              />

              <ActionPowerPanel 
                component={component}
                onChange={(data) => this.handleFormChange(data)}
                onChangeByName={(name, data) => this.handleFormChangeByName(name, data)}
              />

              { component.type === 'monument' &&
                <InputGroup className="mb-2">
                  <Form.Check inline type="checkbox" name="hasPlacementPower"
                    id="hasPlacementPower" label="Has placement power"
                    value={component.hasPlacementPower}
                    checked={component.hasPlacementPower}
                    onChange={this.handleFormChange}/>
                </InputGroup>
              }

              <ReactPowerPanel 
                component={component}
                onChange={(data) => this.handleFormChange(data)}
                onChangeByName={(name, data) => this.handleFormChangeByName(name, data)}
              />

              { component.type !== 'mage' && component.type !== 'magicItem' &&
                <>
                  <div className="inline-label mb-2">
                    <Form.Check inline type="checkbox" name="hasVictoryPoint"
                      id="hasVictoryPoint" label="Has victory point(s)"
                      value={component.hasVictoryPoint}
                      checked={component.hasVictoryPoint}
                      onChange={this.handleFormChange}/>

                  </div>
                  
                  { component.hasVictoryPoint && 
                      <div className="inline-input">
                        <InputGroup.Prepend>
                          <InputGroup.Text className="victory-points" id="victoryPoint">{component.victoryPoint || 0}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <InputGroup.Append>
                          <div className="vertical-buttons">
                            <Button variant="secondary" id="lowerVictoryPoint"
                              onClick={() => this.increment("victoryPoint")}><span>+</span></Button>
                            <Button variant="secondary" id="raiseVictoryPoint"
                              onClick={() => this.decrement("victoryPoint")}><span>-</span></Button>
                          </div>
                        </InputGroup.Append>
                      </div>
                    }
                </>
              }

              { component.type === 'placeOfPower' &&
                <>
                  <InputGroup className="mb-2">
                    <Form.Check inline type="checkbox" name="hasConditionalVictoryPoint"
                      id="hasConditionalVictoryPoints" label="Has conditional victory point(s)"
                      value={component.hasConditionalVictoryPoint}
                      checked={component.hasConditionalVictoryPoint}
                      onChange={this.handleFormChange}/>
                  </InputGroup>
                </>
              }

              { component.type === 'artefact' && 
                <>
                  <InputGroup className="mb-2">
                    <Form.Check inline type="checkbox" name="isCreature"
                      id="isCreature" label="Is a creature"
                      value={component.isCreature}
                      checked={component.isCreature}
                      onChange={this.handleFormChange}/>
                  </InputGroup>

                  <InputGroup className="mb-2">
                    <Form.Check inline type="checkbox" name="isDragon"
                      id="isDragon" label="Is a dragon"
                      value={component.isDragon}
                      checked={component.isDragon}
                      onChange={this.handleFormChange}/>
                  </InputGroup>
                </>
              }

              { component.type === 'mage' && 
                <>
                  <InputGroup className="mb-2">
                    <Form.Check inline type="checkbox" name="hasAlternative"
                      id="hasAlternative" label="Has an alternative card"
                      value={component.hasAlternative}
                      checked={component.hasAlternative}
                      onChange={this.handleFormChange}/>
                  </InputGroup>

                  <InputGroup className="mb-2">
                    <Form.Check inline type="checkbox" name="isAlternative"
                      id="isAlternative" label="Is an alternative card"
                      value={component.isAlternative}
                      checked={component.isAlternative}
                      onChange={this.handleFormChange}/>
                  </InputGroup>

                  {component.isAlternative && 
                      <InputGroup size="sm" className="mb-2">
                        <InputGroup.Prepend>
                          <InputGroup.Text id="name">Component Id</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          placeholder="Id"
                          name="altOfId"
                          value={component.altOfId}
                          onChange={this.handleFormChange}
                        />
                      </InputGroup>
                  }
                </>
              }
              <ButtonToolbar>
                <Button variant="secondary" size="sm" onClick={onSave} disabled={!component.name.trim()}>Save</Button>
                <Button variant="secondary" size="sm" onClick={this.handleReset}>Reset</Button>
              </ButtonToolbar>
            </ Form.Group>
          </form>
        }
      </div>
    )
  }
}

const mapStateToProps = (store) => {
  return {
    component: store.editor.component,
    componentDidChange: store.editor.timeIndicator,
    pristineComponent: store.editor.pristineComponent,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteComponent: (component) => dispatch(deleteComponent(component)),
    saveComponent: (component) => dispatch(saveComponent(component)),
    showComponentJSON: (component) => dispatch({ type: 'FORM_CHANGE', component})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentForm)

class EssencePanel extends Component {

  decrement = (type) => {
    const { essenceList } = this.props
    let data = essenceList.length > 0 ? JSON.parse(JSON.stringify(essenceList)) : []
    let typeIndex = data.findIndex((item) => {
      return item.type === type
    })    
    if(typeIndex !== -1) {
      if(data[typeIndex].quantity > 0) {
        --data[typeIndex].quantity
      } else {
        data.splice(typeIndex, 1)
      }
    }
    this.props.onChange(data)
  }

  increment = (type) => {
    const { essenceList } = this.props
    let data = JSON.parse(JSON.stringify(essenceList))
    let typeIndex = Array.isArray(data) && data.findIndex((item) => {
      return item.type === type
    })
    if (typeIndex && typeIndex === -1) {
      let item = { type, quantity: 1}
      data.push(item)
    } else {
      data[typeIndex].quantity++
    }
    this.props.onChange(data)
  }

  render() {
    const { essenceList } = this.props
    const essenceTypes = [ 'elan', 'life', 'calm', 'death', 'gold', 'any', 'any-but-gold', 'any-but-death-gold', 'any-but-life-gold']
    const components = essenceTypes.map((type, index) => {
      let essence = Array.isArray(essenceList) ? essenceList.find((item) => item.type === type) : null
      return (
        <div className="inline-input" key={index} >
          <InputGroup.Prepend>
            <InputGroup.Text className={"essence "+type} id={type+'Essence'}>{(essence && essence.quantity) || 0}</InputGroup.Text>
          </InputGroup.Prepend>
          <InputGroup.Append>
            <div className="vertical-buttons">
              <Button variant="secondary" id={'lower'+type+'CollectOptions'}
                onClick={() => this.increment(type)}><span>+</span></Button>
              <Button variant="secondary" id={'raise'+type+'Essence'}
                onClick={() => this.decrement(type)}><span>-</span></Button>
            </div>
          </InputGroup.Append>
        </div>
      )
    })
    return <div className="mb-2">
      {components}
    </div>
  }
}

function DiscountPanel({component, onChange, onChangeByName}) {
  const [abilities, setAbilities] = useState([copy(DISCOUNT)])

  useEffect(() => {
    setAbilities(component.discountAbilityList || [copy(DISCOUNT)])
  },[component.name])

  function addAbility() {
    abilities.push(copy(DISCOUNT))
    setAbilities(abilities)
    onChangeByName('discountAbilityList', abilities)
  }

  function removeAbility() {
    abilities.pop()
    setAbilities(abilities)
    onChangeByName('discountAbilityList', abilities)
  }

  function updateDiscount(index, data) {
    abilities[index].discountList = data
    onChangeByName('discountAbilityList', abilities)
  }

  function setDiscountType(index, discountType) {
    console.log('setDiscountType',index, discountType);
    if (abilities[index].type.includes(discountType)) {
      abilities[index].type = abilities[index].type.filter((type) => type !== discountType)
    } else {
      abilities[index].type.push(discountType)
    }
    onChangeByName('discountAbilityList', abilities)
  }

  const discountTypes = [
    { id: 'artefact', name: 'Artefact' },
    { id: 'dragon', name: 'Dragon' },
    { id: 'creature', name: 'Creature' },
    { id: 'monument', name: 'Monument' },
    { id: 'placeOfPower', name: 'Place of Power' }
  ]
  
  return <>
    <InputGroup className="mb-2">
      <Form.Check inline type="checkbox" name="hasDiscountAbility"
        id="hasDiscountAbility" label="Has discount ability"
        value={component.hasDiscountAbility}
        checked={component.hasDiscountAbility}
        onChange={(e) => onChange(e)}/>

        { component.hasDiscountAbility && 
          <ButtonToolbar>
            <Button variant="secondary" size="sm" onClick={() => addAbility()}>
              <FontAwesomeIcon icon={faPlus} size="sm" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => removeAbility()}>
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </Button>
          </ButtonToolbar>
        }
    </InputGroup>
   
    { component.hasDiscountAbility && abilities.map((discount, index) => 
      <div key={index}>
        <div className="mb-2 ml-2">
          <div className="inline-label mr-2">Discount target :</div>
          <div className="inline-checkbox ml-2">
            {discountTypes.map((discountType) => (
              <Form.Check inline type="checkBox" name="discountType" 
                key={index + '_type_' + discountType.id} id={index + '_type_' + discountType.id} label={discountType.name}
                checked={discount.type.includes(discountType.id)}
                onChange={(e) => setDiscountType(index, discountType.id)}
              />
            ))}
          </div>
        </div>
        <EssencePanel 
          essenceList={discount.discountList}
          onChange={(data) => updateDiscount(index, data)}
        />
      </div>
    )}
  </>
}

/**
 * Render the reaction action power panel to add reaction powers to the component.
 */
function ReactPowerPanel({component, onChange, onChangeByName}) {
  const [reactPowers, setReactPowers] = useState([copy(REACT_POWER)])

  useEffect(() => {
    setReactPowers(component.reactPowerList || [copy(REACT_POWER)])
  },[component.name])

  function addReactPower() {
    reactPowers.push(copy(REACT_POWER))
    setReactPowers(reactPowers)
    onChangeByName('reactPowerList', reactPowers)
  }

  function removeReactPower() {
    reactPowers.pop()
    setReactPowers(reactPowers)
    onChangeByName('reactPowerList', reactPowers)
  }

  function updateReactPower(index, data, target) {
    if (target === 'costEssenceList') {
      reactPowers[index].cost.essenceList = data
    } else if (target === 'gainEssenceList') {
      reactPowers[index].gain.essenceList = data
    } else if (target === 'costTurn') {
      reactPowers[index].cost.turn = !!reactPowers[index].cost.turn ? false : true
    } else if (target === 'gainIgnore') {
      reactPowers[index].gain.ignore = !!reactPowers[index].gain.ignore ? false : true
    } else if (target === 'gainOnComponent') {
      reactPowers[index].gain.onComponent = !!reactPowers[index].gain.onComponent ? false : true
    }
    onChangeByName('reactPowerList', reactPowers)
  }

  function setReactPowerType(index, reactPowerType) {
    console.log('setReactPowerType',index, reactPowerType);
    if (reactPowers[index].type.includes(reactPowerType)) {
      reactPowers[index].type = reactPowers[index].type.filter((type) => type !== reactPowerType)
    } else {
      reactPowers[index].type.push(reactPowerType)
    }
    onChangeByName('reactPowerList', reactPowers)
  }

  function decrement(index) {
    let tempVP = reactPowers[index].gain.temporaryVictoryPoints
    if (tempVP === 0) {
      delete reactPowers[index].gain.temporaryVictoryPoints
    } else {
      tempVP = tempVP - 1
      reactPowers[index].gain.temporaryVictoryPoints = tempVP
    }
    onChangeByName('reactPowerList', reactPowers)
  }

  function increment (index) {
    let tempVP = reactPowers[index].gain.temporaryVictoryPoints
    if (tempVP > 0) {
      tempVP = tempVP + 1
    } else {
      tempVP = 1
    }
    reactPowers[index].gain.temporaryVictoryPoints = tempVP
    onChangeByName('reactPowerList', reactPowers)
  }

  const reactPowerTypes = [
    { id: 'LIFE_LOSS', name: 'Life loss' },
    { id: 'DRAGON', name: 'Dragon' },
    { id: 'VICTORY_CHECK', name: 'Victory Check' }
  ]
  
  return <>
    <InputGroup className="mb-2">
      <Form.Check inline type="checkbox" name="hasReactPower"
        id="hasReactPower" label="Has react power"
        value={component.hasReactPower}
        checked={component.hasReactPower}
        onChange={(e) => onChange(e)}/>

        { component.hasReactPower && 
          <ButtonToolbar>
            <Button variant="secondary" size="sm" onClick={() => addReactPower()}>
              <FontAwesomeIcon icon={faPlus} size="sm" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => removeReactPower()}>
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </Button>
          </ButtonToolbar>
        }
    </InputGroup>
   
    { component.hasReactPower && reactPowers.map((reactPower, index) => 
      <div key={index}>
        <div className="mb-2 ml-2">
          <div className="inline-label">Type List :</div>
          <div className="inline-checkbox ml-2">
            {reactPowerTypes.map((reactPowerType) => (
              <Form.Check inline type="checkBox" name="reactPowerType" 
                key={index + '_type_' + reactPowerType.id} id={index + '_type_' + reactPowerType.id} label={reactPowerType.name}
                checked={reactPower.type.includes(reactPowerType.id)}
                onChange={(e) => setReactPowerType(index, reactPowerType.id)}
              />
            ))}
          </div>
        </div>

        <div className="mb-2 ml-2">
          <div className="inline-label">Cost List :</div>
          <input name="costTurn" type="checkBox" id={'costTurn_' + index} className="inline-checkbox ml-2"
            checked={reactPower.cost.turn}
            onChange={(e) => updateReactPower(index, null, 'costTurn')}
          />
          <div className="turn-component-icon" onClick={(e) => updateReactPower(index, null, 'costTurn')}></div>
        </div>
        <EssencePanel
          essenceList={reactPower.cost.essenceList}
          onChange={(data) => updateReactPower(index, data, 'costEssenceList')}
        />
        <div className="mb-2 ml-2">
          <div className="inline-label">Gain List :</div>
          <Form.Check inline type="checkBox" name="gainIgnore" label="Ignore"
            id={'gainIgnore_' + index} className="ml-2"
            checked={reactPower.gain.ignore}
            onChange={(e) => updateReactPower(index, null, 'gainIgnore')}
          />
          <Form.Check inline type="checkBox" name="gainOnComponent" label="Essence on component"
            id={'gainOnComponent_' + index} className="ml-2"
            checked={reactPower.gain.onComponent}
            onChange={(e) => updateReactPower(index, null, 'gainOnComponent')}
          />
          { reactPowers[index].type.filter((type) => type === 'VICTORY_CHECK').length > 0 && 
            <>
              <div className="inline-label">Temporary Victory Points </div>
              <div className="inline-input">
                  <InputGroup.Prepend>
                    <InputGroup.Text className="victory-points" id="victoryPoint">{reactPower.gain.temporaryVictoryPoints || 0}</InputGroup.Text>
                  </InputGroup.Prepend>
                  <InputGroup.Append>
                    <div className="vertical-buttons">
                      <Button variant="secondary" id="lowerVictoryPoint"
                        onClick={() => increment(index)}><span>+</span></Button>
                      <Button variant="secondary" id="raiseVictoryPoint"
                        onClick={() => decrement(index)}><span>-</span></Button>
                    </div>
                  </InputGroup.Append>
              </div>
            </>
          }
        </div>
        
        <EssencePanel
          essenceList={reactPower.gain.essenceList}
          onChange={(data) => updateReactPower(index, data, 'gainEssenceList')}
        />
      </div>
    )}
  </>
}

/**
 * Render the action power panel to add actions to the component.
 */
function ActionPowerPanel({component, onChange, onChangeByName}) {
  const [actionPowers, setActionPowers] = useState([copy(REACT_POWER)])

  useEffect(() => {
    setActionPowers(component.actionPowerList || [copy(REACT_POWER)])
  },[component.name])

  function addActionPower() {
    actionPowers.push(copy(REACT_POWER))
    setActionPowers(actionPowers)
    onChangeByName('actionPowerList', actionPowers)
  }

  function removeActionPower() {
    actionPowers.pop()
    setActionPowers(actionPowers)
    onChangeByName('actionPowerList', actionPowers)
  }

  function updateActionPower(index, data, target) {
    if (target === 'costEssenceList') {
      actionPowers[index].cost.essenceList = data
    } else if (target === 'costTurn') {
      actionPowers[index].cost.turn = !!actionPowers[index].cost.turn ? false : true
    } else if (target === 'costTurnDragon') {
      actionPowers[index].cost.turnDragon = !!actionPowers[index].cost.turnDragon ? false : true
    } else if (target === 'costTurnCreature') {
      actionPowers[index].cost.turnCreature = !!actionPowers[index].cost.turnCreature ? false : true
    } else if (target === 'costOnComponent') {
      actionPowers[index].cost.onComponent = !!actionPowers[index].cost.onComponent ? false : true
    } else if (target === 'costSameType') {
      actionPowers[index].cost.sameType = !!actionPowers[index].cost.sameType ? false : true
    } else if (target === 'costDiscardOneArtefact') {
      actionPowers[index].cost.discardOneArtefact = !!actionPowers[index].cost.discardOneArtefact ? false : true
    } else if (target === 'costDestroyThisArtefact') {
      actionPowers[index].cost.destroyThisArtefact = !!actionPowers[index].cost.destroyThisArtefact ? false : true
    } else if (target === 'costDestroyOneArtefact') {
      actionPowers[index].cost.destroyOneArtefact = !!actionPowers[index].cost.destroyOneArtefact ? false : true
    } else if (target === 'costDestroyOneOtherArtefact') {
      actionPowers[index].cost.destroyOneOtherArtefact = !!actionPowers[index].cost.destroyOneOtherArtefact ? false : true
    } else if (target === 'gainEssenceList') {
      actionPowers[index].gain.essenceList = data
    } else if (target === 'gainOnComponent') {
      actionPowers[index].gain.onComponent = !!actionPowers[index].gain.onComponent ? false : true
    } else if (target === 'gainPlaceDragonOrCreatureFromAnyDiscard') {
      actionPowers[index].gain.placeDragonOrCreatureFromAnyDiscard = !!actionPowers[index].gain.placeDragonOrCreatureFromAnyDiscard ? false : true
    } else if (target === 'gainPlaceArtefactFromDiscard') {
      actionPowers[index].gain.placeArtefactFromDiscard = !!actionPowers[index].gain.placeArtefactFromDiscard ? false : true
    }
    
    onChangeByName('actionPowerList', actionPowers)
  }

  return <>
    <InputGroup className="mb-2">
      <Form.Check inline type="checkbox" name="hasActionPower"
        id="hasActionPower" label="Has action power"
        value={component.hasActionPower}
        checked={component.hasActionPower}
        onChange={(e) => onChange(e)}/>

        { component.hasActionPower && 
          <ButtonToolbar>
            <Button variant="secondary" size="sm" onClick={() => addActionPower()}>
              <FontAwesomeIcon icon={faPlus} size="sm" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => removeActionPower()}>
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </Button>
          </ButtonToolbar>
        }
    </InputGroup>
   
    { component.hasActionPower && actionPowers.map((actionPower, index) => 
      <div key={index}>

        <div className="mb-2 ml-2">
          <div className="inline-label">Cost List :</div>

          <input type="checkBox" name="costTurn" id={'costTurn_' + index} className="inline-checkbox ml-2"
            checked={actionPower.cost.turn}
            onChange={(e) => updateActionPower(index, null, 'costTurn')}
          />
          <label htmlFor={'costTurn_' + index} className="inline-label"><div className="turn-component-icon"></div></label>

          <input type="checkBox" name="costTurnDragon" id={'costTurnDragon_' + index} className="inline-checkbox ml-2"
            checked={actionPower.cost.turnDragon}
            onChange={(e) => updateActionPower(index, null, 'costTurnDragon')}
          />
          <label htmlFor={'costTurnDragon_' + index} className="inline-label"><div className="turn-dragon-icon"></div></label>

          <input type="checkBox" name="costTurnCreature" id={'costTurnCreature_' + index} className="inline-checkbox ml-2"
            checked={actionPower.cost.turnCreature}
            onChange={(e) => updateActionPower(index, null, 'costTurnCreature')}
          />
          <label htmlFor={'costTurnCreature_' + index} className="inline-label"><div className="turn-creature-icon"></div></label>

          <input type="checkBox" name="costOnComponent" id={'costOnComponent_' + index} className="inline-checkbox ml-2"
            checked={actionPower.gain.onComponent}
            onChange={(e) => updateActionPower(index, null, 'costOnComponent')}
          />
          <label htmlFor={'costOnComponent_' + index} className="inline-label">Essence <div className="on-component-icon"></div></label>
          
          <input type="checkBox" name="costSameType" id={'costSameType_' + index} className="inline-checkbox ml-2"
            checked={actionPower.cost.sameType}
            onChange={(e) => updateActionPower(index, null, 'costSameType')}
          />
          <label htmlFor={'costSameType_' + index} className="inline-label"><div className="essence any-same-type"></div></label>

          <input type="checkBox" name="costDestroyOneArtefact" id={'costDestroyOneArtefact_' + index} className="inline-checkbox ml-2"
            checked={actionPower.gain.destroyOneArtefact}
            onChange={(e) => updateActionPower(index, null, 'costDestroyOneArtefact')}
          />
          <label htmlFor={'costDestroyOneArtefact_' + index} className="inline-label">Destroy one of your artefacts</label>
          
          <input type="checkBox" name="costDestroyOneOtherArtefact" id={'costDestroyOneOtherArtefact_' + index} className="inline-checkbox ml-2"
            checked={actionPower.gain.destroyOneOtherArtefact}
            onChange={(e) => updateActionPower(index, null, 'costDestroyOneOtherArtefact')}
          />
          <label htmlFor={'costDestroyOneOtherArtefact_' + index} className="inline-label">Destroy one of your artefacts</label>
          
        </div>
        <EssencePanel
          essenceList={actionPower.cost.essenceList}
          onChange={(data) => updateActionPower(index, data, 'costEssenceList')}
        />
        <div className="mb-2 ml-2">
          <div className="inline-label">Gain List :</div>
          <input type="checkBox" name="gainOnComponent" id={'gainOnComponent_' + index} className="inline-checkbox ml-2"
            checked={actionPower.gain.onComponent}
            onChange={(e) => updateActionPower(index, null, 'gainOnComponent')}
          />
          <label htmlFor={'gainOnComponent_' + index} className="inline-label">Essence <div className="on-component-icon"></div></label>
          
          <input type="checkBox" name="gainPlaceDragonOrCreatureFromAnyDiscard" id={'gainPlaceDragonOrCreatureFromAnyDiscard_' + index} className="inline-checkbox ml-2"
            checked={actionPower.gain.placeDragonOrCreatureFromAnyDiscard_}
            onChange={(e) => updateActionPower(index, null, 'gainPlaceDragonOrCreatureFromAnyDiscard')}
          />
          <label htmlFor={'gainPlaceDragonOrCreatureFromAnyDiscard_' + index} className="inline-label">
            Place <div className="dragon-icon"></div>or<div className="creature-icon"></div>from any discard
          </label>
          <input type="checkBox" name="gainPlaceArtefactFromDiscard" id={'gainPlaceArtefactFromDiscard_' + index} className="inline-checkbox ml-2"
            checked={actionPower.gain.placeArtefactFromDiscard}
            onChange={(e) => updateActionPower(index, null, 'gainPlaceArtefactFromDiscard')}
          />
          <label htmlFor={'gainPlaceArtefactFromDiscard_' + index} className="inline-label">
            Place an artefact from discard
          </label>
          
          <div className="component-cost-icon"></div>
          <div className="component-icon"></div>
          <div className="on-component-icon"></div>
          <div className="turn-component-icon"></div>
          <div className="straighten-component-icon"></div>
          <div className="straighten-self-icon"></div>
          <div className="dragon-icon"></div>
          <div className="creature-icon"></div>
          <div className="turn-dragon-icon"></div>
          <div className="turn-creature-icon"></div>
          <div className="straighten-creature-icon"></div>
        </div>
        
        <EssencePanel
          essenceList={actionPower.gain.essenceList}
          onChange={(data) => updateActionPower(index, data, 'gainEssenceList')}
        />
      </div>
    )}
  </>
}

function copy(value){
  return JSON.parse(JSON.stringify(value))
}