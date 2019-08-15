import React, { Component, useEffect, useState } from 'react'
import { Button, ButtonToolbar, Form, InputGroup} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlash, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ACTION_POWER, COMPONENTS_TYPE, DEFAULT_COMPONENT, DISCOUNT, REACT_POWER, SPECIFIC_COLLECT_ABILITY, STANDARD_COLLECT_ABILITY } from './EditorConstants'
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
      <div className="form-panel scrollable">
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
                        <EssencePanel panelType="cost"
                          essenceList={component.costEssenceList || []}
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
                      essenceList={(component.standardCollectAbility && component.standardCollectAbility.essenceList) || []}
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
                    <EssencePanel panelType="all"
                      essenceList={(component.specificCollectAbility && component.specificCollectAbility.essenceList) || []}
                      onChange={(data) => this.handleFormChangeByName('specificCollectAbility', data)}
                    />
                  </div>
                  <div className="mb-2">
                    <InputGroup className="mb-2">
                      <Form.Check inline type="checkbox" name="multipleCollectOptions"
                        id="multipleCollectOptions" label="Player can choose essences"
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
                  <div className="inline-block mb-2">
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
      if(data[typeIndex].quantity !== 0) {
        --data[typeIndex].quantity
      } else {
        data.splice(typeIndex, 1)
      }
    } else {
      let item = { type, quantity: -1}
      data.push(item)
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
    const { cost, essenceList, modifier, or, panelType } = this.props
    let essenceTypes
    if (panelType === 'cost') {
      essenceTypes = ['elan', 'life', 'calm', 'death', 'gold', 'any']
    } else if (panelType === 'any') {
      essenceTypes = ['any']
    } else if (panelType === 'anyButGold') {
      essenceTypes = ['any-but-gold']
    } else if (panelType === 'anyBut') {
      essenceTypes = ['any-but-gold', 'any-but-death-gold', 'any-but-life-gold']
    } else if (panelType === 'all') {
      essenceTypes = ['elan', 'life', 'calm', 'death', 'gold', 'any', 'any-but-gold', 'any-but-death-gold', 'any-but-life-gold']
    } else {
      essenceTypes = ['elan', 'life', 'calm', 'death', 'gold']
    }
    const components = essenceTypes.map((type, index) => {
      let essence = Array.isArray(essenceList) ? essenceList.find((item) => item.type === type) : null
      let isLast = index === essenceTypes.length - 1
      let classModifier = modifier && essence && essence.quantity ? ' modifier' : ''
      let signModifier = modifier && essence && essence.quantity > 0 ? '+' : ''
      return (
        <div className="inline-input" key={index} >
          <InputGroup.Prepend>
            <InputGroup.Text className={"essence "+type+classModifier} id={type+'Essence'}>
              {cost && <div className="cost"></div>}{signModifier}{(essence && essence.quantity) || 0}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <InputGroup.Append>
            <div className="vertical-buttons">
              <Button variant="secondary" id={'lower'+type+'CollectOptions'}
                onClick={() => this.increment(type)}><span>+</span></Button>
              <Button variant="secondary" id={'raise'+type+'Essence'}
                onClick={() => this.decrement(type)}><span>-</span></Button>
            </div>
          </InputGroup.Append>
          {!isLast && or &&
            <div className={'operator'}>
              <FontAwesomeIcon icon={faSlash} size="sm" rotation={90} />
            </div>
          }
        </div>
      )
    })
    return components
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

  function removeAbility(index) {
    abilities.splice(index, 1)
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
  
  const splitter = <div className="clear"></div>
  
  return <>
    <InputGroup className="mb-2">
      <Form.Check inline type="checkbox" name="hasDiscountAbility"
        id="hasDiscountAbility" label="Has discount ability"
        value={component.hasDiscountAbility}
        checked={component.hasDiscountAbility}
        onChange={(e) => onChange(e)}/>
    </InputGroup>
   
    { component.hasDiscountAbility && abilities.map((discount, index) => 
      <div key={index} className="mb-2 ml-2">

        <InputGroup>
          <div className="inline-flex">Discount ability {index+1}</div>
          <ButtonToolbar>
            <Button variant="secondary" size="sm" onClick={() => removeAbility(index)}>
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </Button>
          </ButtonToolbar>
        </InputGroup>
        
        <div className="mb-2 ml-2">
          <div className="inline-block">Discount target :</div>

          <div className="ml-1">
            <div className="inline-block mb-2">
              {discountTypes.map((discountType) => (
                <Form.Check inline type="checkBox" name="discountType"  className="ml-2"
                  key={index + '_type_' + discountType.id} id={index + '_type_' + discountType.id} label={discountType.name}
                  checked={discount.type.includes(discountType.id)}
                  onChange={(e) => setDiscountType(index, discountType.id)}
                />
              ))}
            </div>
            {splitter}
            <EssencePanel panelType="all"
              essenceList={discount.discountList || []}
              onChange={(data) => updateDiscount(index, data)}
            />
          </div>
        </div>
      </div>
    )}
    { component.hasDiscountAbility && 
      <ButtonToolbar className="ml-3 mb-2">
        <Button variant="secondary" size="sm" onClick={() => addAbility()}>
          Add discount ability
        </Button>
      </ButtonToolbar>
    }
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

  function removeReactPower(index) {
    reactPowers.splice(index, 1)
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

  const splitter = <div className="clear"></div>
  
  return <>
    <InputGroup className="mb-2">
      <Form.Check inline type="checkbox" name="hasReactPower"
        id="hasReactPower" label="Has react power"
        value={component.hasReactPower}
        checked={component.hasReactPower}
        onChange={(e) => onChange(e)}/>
    </InputGroup>
   
    { component.hasReactPower && reactPowers.map((reactPower, index) => 
      <div key={index} className="mb-2 ml-2">
        
        <InputGroup>
          <div className="inline-flex">React power {index+1}</div>
          { component.hasReactPower && 
            <ButtonToolbar>
              <Button variant="secondary" size="sm" onClick={() => removeReactPower(index)}>
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </Button>
            </ButtonToolbar>
          }
        </InputGroup>

        <div className="mb-2 ml-2">
          <div className="inline-block">React type :</div>

          <div className="ml-1">
            <div className="inline-block">
              {reactPowerTypes.map((reactPowerType) => (
                <Form.Check inline type="checkBox" name="reactPowerType" className="ml-2"
                  key={index + '_type_' + reactPowerType.id} id={index + '_type_' + reactPowerType.id} label={reactPowerType.name}
                  checked={reactPower.type.includes(reactPowerType.id)}
                  onChange={(e) => setReactPowerType(index, reactPowerType.id)}
                />
              ))}
            </div>
          </div>
          {splitter}
        </div>

        <div className="mb-2 ml-2">
          <div className="inline-block">Cost List :</div>

          <div className="ml-1">
            <div className="mb-2 inline-block">
              <input name="costTurn" type="checkBox" id={'costTurn_' + index} className="inline-checkbox ml-2"
                checked={reactPower.cost.turn}
                onChange={(e) => updateReactPower(index, null, 'costTurn')}
              />
              <div className="turn-component-icon" onClick={(e) => updateReactPower(index, null, 'costTurn')}></div>
            </div>
            {splitter}
            <EssencePanel
              essenceList={reactPower.cost.essenceList || []}
              onChange={(data) => updateReactPower(index, data, 'costEssenceList')}
            />
          </div>
        </div>

        <div className="mb-2 ml-2">
          <div className="inline-block">Gain List :</div>

          <div className="ml-1">
            <div className="mb-2 inline-block">
              <Form.Check inline type="checkBox" name="gainIgnore" label="Ignore"
                id={'gainIgnore_' + index} className="ml-2"
                checked={reactPower.gain.ignore}
                onChange={(e) => updateReactPower(index, null, 'gainIgnore')}
              />
            </div>
            {splitter}
            <EssencePanel
              essenceList={reactPower.gain.essenceList || []}
              onChange={(data) => updateReactPower(index, data, 'gainEssenceList')}
            />
            {splitter}
            <div className="mb-2 inline-block">
              <Form.Check inline type="checkBox" name="gainOnComponent" label={<>Essence gain on component <div className="icon on-component-icon"></div></>}
                id={'gainOnComponent_' + index} className="ml-2"
                checked={reactPower.gain.onComponent}
                onChange={(e) => updateReactPower(index, null, 'gainOnComponent')}
              />
            </div>
            {splitter}
            { reactPowers[index].type.filter((type) => type === 'VICTORY_CHECK').length > 0 && 
              <div className="mb-2 ml-2 inline-block">
                <div className="inline-block">Temporary Victory Points </div>
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
              </div>
            }
          </div>
        </div>
      </div>
    )}
    { component.hasReactPower && 
      <ButtonToolbar className="ml-3 mb-2">
        <Button variant="secondary" size="sm" onClick={() => addReactPower()}>
          Add react Power
        </Button>
      </ButtonToolbar>
    }
  </>
}

/**
 * Render the action power panel to add actions to the component.
 */
function ActionPowerPanel({component, onChange, onChangeByName}) {
  const [actionPowers, setActionPowers] = useState([copy(ACTION_POWER)])

  useEffect(() => {
    setActionPowers(component.actionPowerList || [copy(ACTION_POWER)])
  },[component.name])

  function addActionPower() {
    actionPowers.push(copy(ACTION_POWER))
    setActionPowers(actionPowers)
    onChangeByName('actionPowerList', actionPowers)
  }

  function removeActionPower(index) {
    actionPowers.splice(index, 1)
    setActionPowers(actionPowers)
    onChangeByName('actionPowerList', actionPowers)
  }

  function updateActionPower(index, type, target, data) {
    if(!!data) {
      actionPowers[index][type][target] = data
    } else {
      if(!actionPowers[index][type][target]) {
        actionPowers[index][type][target] = true
      } else {
        delete actionPowers[index][type][target]
      }
    }
    onChangeByName('actionPowerList', actionPowers)
  }

  function renderCheckBox(index, type, target, label, data) {
    return <div className="inline-block">
      <input type="checkBox" className="inline-checkbox ml-2"
        name={type + target + '_' + index}
        id={type + target + '_' + index}
        checked={actionPowers[index][type][target]}
        onChange={(e) => updateActionPower(index, type, target, data)}
      />
      <label htmlFor={type + target + '_' + index} className="inline-block">
        {label}
      </label>
    </div>
  }

  function renderCheckBoxCost(index, target, label, data) {
    return renderCheckBox(index, 'cost', target, label, data)
  }

  function renderCheckBoxGain(index, target, label, data) {
    return renderCheckBox(index, 'gain', target, label, data)
  }

  const splitter = <div className="clear"></div>

  return <>
    <InputGroup className="mb-2">
      <Form.Check inline type="checkbox" name="hasActionPower"
        id="hasActionPower" label="Has action power"
        value={component.hasActionPower}
        checked={component.hasActionPower}
        onChange={(e) => onChange(e)}/>
    </InputGroup>
   
    { component.hasActionPower && actionPowers.map((actionPower, index) => 
      <div key={index} className="mb-2 ml-2">
        <InputGroup>
          <div className="inline-flex">Action {index+1}</div>
          { component.hasActionPower && 
            <ButtonToolbar>
              <Button variant="secondary" size="sm" onClick={() => removeActionPower(index)}>
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </Button>
            </ButtonToolbar>
          }
        </InputGroup>

        <div className="mb-2 ml-2">
          <div className="inline-block">Cost List :</div>

          <div className="ml-1">
            {renderCheckBoxCost(index, 'turn',
              <><div className="icon turn-component-icon"></div></>
            )}
            {renderCheckBoxCost(index, 'turnDragon',
              <><div className="icon turn-dragon-icon"></div></>
            )}
            {renderCheckBoxCost(index, 'turnCreature',
              <><div className="icon turn-creature-icon"></div></>
            )}
            {renderCheckBoxCost(index, 'onlyWhenTurned',
              <>When this card is turned</>
            )}
            {splitter}
            {renderCheckBoxCost(index, 'multipleCostOptions',
              <>The player can choose which essence to pay</>
            )}
            {splitter}
            <label className="ml-2">
              <EssencePanel or={actionPower.cost.multipleCostOptions} cost={true}
                essenceList={actionPower.cost.essenceList || []} panelType='cost'
                onChange={(data) => updateActionPower(index, 'cost', 'essenceList', data)}
              />
                {renderCheckBoxCost(index, 'sameType',
                  <>+ <div className="essence any-same-type"><div className="cost"></div></div></>
                )}
            </label>
            {splitter}
            {renderCheckBoxCost(index, 'onComponent',
              <>Essence cost from <div className="icon on-component-icon"></div></>
            )}
            {splitter}
            {renderCheckBoxCost(index, 'destroySelf',
              <>Destroy <div className="icon on-component-icon"></div></>
            )}
            {splitter}
            {renderCheckBoxCost(index, 'destroyOneArtefact',
              <>Destroy one of your artifacts</>
            )}
            {splitter}
            {renderCheckBoxCost(index, 'destroyOneDragonOrCreature',
              <>Destroy one of your Dragons or Creatures</>
            )}
            {splitter}
            {renderCheckBoxCost(index, 'destroyAnotherArtefact',
              <>Destroy another of your artifacts</>
            )}
            {splitter}
            {renderCheckBoxCost(index, 'discardArtefact',
              <>Discard a card</>
            )}
          </div>
        </div>

        <div className="mb-2 ml-2">
          <div className="inline-block">Gain List :</div>

          <div className="ml-1">
            {renderCheckBoxGain(index, 'straightenComponent',
              <><div className="icon straighten-component-icon"></div></>
            )}
            {renderCheckBoxGain(index, 'straightenSelf',
              <><div className="icon straighten-self-icon"></div></>
            )}
            {renderCheckBoxGain(index, 'straightenCreature',
              <><div className="icon straighten-creature-icon"></div></>
            )}
            {splitter}
            <div className="ml-2">
              <EssencePanel panelType="all"
                essenceList={actionPower.gain.essenceList || []}
                onChange={(data) => updateActionPower(index, 'gain', 'essenceList', data)}
              />
            </div>
            {renderCheckBoxGain(index, 'onComponent',
              <>Essence gain on <div className="icon on-component-icon"></div></>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'putItOnComponent',
              <>Essence paid goes on <div className="icon on-component-icon"></div></>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'putItOnAnyComponent',
              <>Put the essence spend on <div className="icon component-icon"></div></>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'powerCostAsGold',
              <><div className="essence any-same-type"><div className="cost"></div></div> as <div className="essence gold mt-n2"><div className="qm"></div></div></>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'powerCostAsAnySameTypeButGold',
              <><div className="essence any-same-type"><div className="cost"></div></div> as <div className="essence any-same-type-but-gold mt-n2"></div></>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'placementCostAsGold',
              <><div className="icon placement-cost-icon"><div className="qm-dark"></div></div> as <div className="essence gold mt-n2"><div className="qm"></div></div></>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'placementCostAsAnyButGold',
              <><div className="icon placement-cost-icon"><div className="qm-dark"></div></div> as <div className="essence any-but-gold"></div> with modifier
                <EssencePanel panelType="anyButGold" modifier={true}
                  essenceList={(actionPower.gain.placementCostAsAnyButGold && actionPower.gain.modifierList) || []}
                  onChange={(data) => updateActionPower(index, 'gain', 'modifierList', data)}
                />
              </>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'placeDragonFromAnyDiscardPile',
              <>Place <div className="icon dragon-icon"></div>from any player's discard pile at <div className="icon placement-cost-icon"><div className="qm-dark"></div></div></>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'placeDragonForFree',
              <>Place <div className="icon dragon-icon"></div> for free</>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'placeDragon',
              <>Place <div className="icon dragon-icon"></div> at <div className="icon placement-cost-icon"><div className="qm-dark"></div></div> with modifier
                <EssencePanel panelType="anyButGold" modifier={true}
                  essenceList={(actionPower.gain.placeDragon && actionPower.gain.modifierList) || []}
                  onChange={(data) => updateActionPower(index, 'gain', 'modifierList', data)}
                />
              </>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'placeArtefactFromDiscard',
              <>Place any of your discards at <div className="icon placement-cost-icon"><div className="qm-dark"></div></div> with modifier
                <EssencePanel panelType="anyButGold" modifier={true}
                  essenceList={(actionPower.gain.placeArtefactFromDiscard && actionPower.gain.modifierList) || []}
                  onChange={(data) => updateActionPower(index, 'gain', 'modifierList', data)}
                />
              </>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'checkVictoryNow',
              <>Check victory now!</>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'rivalsGain',
              <>All Rivals Gain</>
            )}
            {actionPower.gain.rivalsGain && 
              <div className="ml-2">
                <EssencePanel 
                  essenceList={actionPower.gain.rivalsGainEssenceList || []}
                  onChange={(data) => updateActionPower(index, 'gain', 'rivalsGainEssenceList', data)}
                />
              </div>
            }
            {splitter}
            <div className="inline-block">
              <input type="checkBox" className="inline-checkbox ml-2"
                name={'gainrivalsLoseLife_1' + index} id={'gainrivalsLoseLife_1' + index}
                checked={actionPowers[index]['gain']['rivalsLoseLife'] === 1}
                onChange={(e) => updateActionPower(index, 'gain', 'rivalsLoseLife', actionPower.gain.rivalsLoseLife !== 1 ? 1 : null)}
              />
              <label htmlFor={'gainrivalsLoseLife_1' + index} className="inline-block">
                <>All Rivals Lose <div className="icon essence life-loss">1</div></>
              </label>
            </div>
            <div className="inline-block">
              <input type="checkBox" className="inline-checkbox ml-2"
                name={'gainrivalsLoseLife_2' + index} id={'gainrivalsLoseLife_2' + index}
                checked={actionPowers[index]['gain']['rivalsLoseLife'] === 2}
                onChange={(e) => updateActionPower(index, 'gain', 'rivalsLoseLife', actionPower.gain.rivalsLoseLife !== 2 ? 2 : null)}
              />
              <label htmlFor={'gainrivalsLoseLife_2' + index} className="inline-block">
                <>All Rivals Lose <div className="icon essence life-loss">2</div></>
              </label>
            </div>
            {splitter}
            {actionPowers[index]['gain']['rivalsLoseLife'] && 
              <div className="ml-2">Rivals can ignore life loss with
                <EssencePanel cost={true}
                  essenceList={actionPower.gain.canIgnoreWithEssenceList || []}
                  onChange={(data) => updateActionPower(index, 'gain', 'canIgnoreWithEssenceList', data)}
                />
              </div>
            }
            {splitter}
            {actionPowers[index]['gain']['rivalsLoseLife'] && renderCheckBoxGain(index, 'canIgnoreWithDestroyArtefact',
              <>Rivals can destroy one artifact to ignore life loss</>
            )}
            {splitter}
            {actionPowers[index]['gain']['rivalsLoseLife'] && renderCheckBoxGain(index, 'canIgnoreWithDiscardArtefact',
              <>Rivals can discard one card to ignore life loss</>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'drawOne',
              <>Draw 1 card</>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'drawThreeDiscardThree',
              <>Draw 3 cards, add to hand, discard 3</>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'reorderThree',
              <>Draw 3 cards, reorder, put back (may also use on Monument deck)</>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'asManyCalmThanRivalsElan',
              <>Gain <div className="essence calm">?</div> equal to <div className="essence elan">?</div> of one rival</>
            )}
            {splitter}
            {renderCheckBoxGain(index, 'asManyElanThanRivalsDeath',
              <>Gain <div className="essence elan">?</div> equal to <div className="essence death">?</div> of one rival</>
            )}
          </div>
        </div>
      </div>
    )}
    { component.hasActionPower && 
      <ButtonToolbar className="ml-3 mb-2">
        <Button variant="secondary" size="sm" onClick={() => addActionPower()}>
          Add action Power
        </Button>
      </ButtonToolbar>
    }
  </>
}

function copy(value){
  return JSON.parse(JSON.stringify(value))
}