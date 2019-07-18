import React, { Component } from 'react'
import { Button, ButtonToolbar, Form, InputGroup} from 'react-bootstrap'
import { COMPONENTS_TYPE, DEFAULT_COMPONENT, SPECIFIC_COLLECT_ABILITY, STANDARD_COLLECT_ABILITY } from './EditorConstants'
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
              <InputGroup size="sm" className="mb-3">
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

              <div className="mb-3">
                {componentsType.map((type) => (
                  <Form.Check inline type="radio" name="type"
                    key={'editor'+type.id} id={'editor'+type.id} value={type.id} label={type.name}
                    checked={component.type === type.id}
                    onChange={this.handleFormChange}
                  />
                ))}
              </div>

              {component.type === 'placeOfPower' &&
                <InputGroup size="sm" className="mb-3">
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
                  <InputGroup className="mb-3">
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
                      <div className="mb-3">
                        <EssencePanel
                          essenceList={component.costEssenceList}
                          onChangeByName={(data) => this.handleFormChangeByName('costEssenceList', data)}
                        />
                      </div>
                    </>
                  }
                </>
              }

              <InputGroup className="mb-3">
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
                  <div className="mb-3">
                    <EssencePanel
                      essenceList={component.standardCollectAbility && component.standardCollectAbility.essenceList}
                      onChangeByName={(data) => this.handleFormChangeByName('standardCollectAbility', data)}
                    />
                  </div>
                </>
              }

              <InputGroup className="mb-3">
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
                  <div className="mb-3">
                    <EssencePanel
                      essenceList={component.specificCollectAbility && component.specificCollectAbility.essenceList}
                      onChangeByName={(data) => this.handleFormChangeByName('specificCollectAbility', data)}
                    />
                  </div>
                  <div className="mb-3">
                    <InputGroup className="mb-3">
                      <Form.Check inline type="checkbox" name="multipleCollectOptions"
                        id="multipleCollectOptions" label="Player can choose different essences"
                        value={component.specificCollectAbility.multipleCollectOptions}
                        checked={component.specificCollectAbility.multipleCollectOptions}
                        onChange={this.handleFormChange}/>
                    </InputGroup>
                  </div>
                </>
              }

              <InputGroup className="mb-3">
                <Form.Check inline type="checkbox" name="hasDiscountAbility"
                  id="hasDiscountAbility" label="Has discount ability"
                  value={component.hasDiscountAbility}
                  checked={component.hasDiscountAbility}
                  onChange={this.handleFormChange}/>
              </InputGroup>

              <InputGroup className="mb-3">
                <Form.Check inline type="checkbox" name="hasActionPower"
                  id="hasActionPower" label="Has action Power(s)"
                  value={component.hasActionPower}
                  checked={component.hasActionPower}
                  onChange={this.handleFormChange}/>
              </InputGroup>

              { component.type === 'monument' &&
                <InputGroup className="mb-3">
                  <Form.Check inline type="checkbox" name="hasPlacementPower"
                    id="hasPlacementPower" label="Has placement power"
                    value={component.hasPlacementPower}
                    checked={component.hasPlacementPower}
                    onChange={this.handleFormChange}/>
                </InputGroup>
              }

              <InputGroup className="mb-3">
                <Form.Check inline type="checkbox" name="hasReactPower"
                  id="hasReactPower" label="Has react power"
                  value={component.hasReactPower}
                  checked={component.hasReactPower}
                  onChange={this.handleFormChange}/>
              </InputGroup>

              { component.type !== 'mage' && component.type !== 'magicItem' &&
                <>
                  <InputGroup className="mb-3">
                    <Form.Check inline type="checkbox" name="hasVictoryPoint"
                      id="hasVictoryPoint" label="Has victory point(s)"
                      value={component.hasVictoryPoint}
                      checked={component.hasVictoryPoint}
                      onChange={this.handleFormChange}/>

                    { component.hasVictoryPoint && 
                      <>
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
                      </>
                    }
                  </InputGroup>
                </>
              }

              { component.type === 'placeOfPower' &&
                <>
                  <InputGroup className="mb-3">
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
                  <InputGroup className="mb-3">
                    <Form.Check inline type="checkbox" name="isCreature"
                      id="isCreature" label="Is a creature"
                      value={component.isCreature}
                      checked={component.isCreature}
                      onChange={this.handleFormChange}/>
                  </InputGroup>

                  <InputGroup className="mb-3">
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
                  <InputGroup className="mb-3">
                    <Form.Check inline type="checkbox" name="hasAlternative"
                      id="hasAlternative" label="Has an alternative card"
                      value={component.hasAlternative}
                      checked={component.hasAlternative}
                      onChange={this.handleFormChange}/>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <Form.Check inline type="checkbox" name="isAlternative"
                      id="isAlternative" label="Is an alternative card"
                      value={component.isAlternative}
                      checked={component.isAlternative}
                      onChange={this.handleFormChange}/>
                  </InputGroup>

                  {component.isAlternative && 
                      <InputGroup size="sm" className="mb-3">
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
    this.props.onChangeByName(data)
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
    this.props.onChangeByName(data)
  }

  render() {
    const { essenceList } = this.props
    const essenceTypes = [ 'elan', 'life', 'calm', 'death', 'gold', 'any', 'any-but-gold', 'any-but-death-gold']
    const components = essenceTypes.map((type, index) => {
      let essence = Array.isArray(essenceList) ? essenceList.find((item) => item.type === type) : null
      return (
        <div className="essence-list small" key={index} >
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
    return <div className="mb-3">
      {components}
    </div>
  }
}

function copy(value){
  return JSON.parse(JSON.stringify(value))
}