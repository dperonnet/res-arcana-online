import React, { Component } from 'react'
import { Button, ButtonToolbar, Form, InputGroup} from 'react-bootstrap'
import { COMPONENTS_TYPE, DEFAULT_COMPONENT, DEFAULT_STANDARD_COLLECT_ABILITY } from './EditorConstants'
import './Form.css';
import { connect } from 'react-redux';
import { deleteComponent, saveComponent } from '../../../store/actions/editorActions'

class ComponentForm extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      component: this.getDefaultComponent()
    };
  }

  getDefaultComponent = () => {
    const { pristineComponent } = this.props;
    const component = Object.keys(pristineComponent).length !== 0 ?
      pristineComponent : DEFAULT_COMPONENT;
    return JSON.parse(JSON.stringify(component))
  }

  handleReset = () => {
    const { onReset, pristineComponent } = this.props;
    this.setState({ component: this.getDefaultComponent()})
    onReset();
  }

  handleFormChange = (changeEvent) => {
    const { checked, name, value, type } = changeEvent.target;
    const { showComponentJSON } = this.props;
    const { component } = this.state;
    const valueToUpdate = type === 'checkbox' ? checked : value;
    let newComponent;
    if (name === 'hasStandardCollectAbility') {
      const newSCA = JSON.parse(JSON.stringify(DEFAULT_STANDARD_COLLECT_ABILITY));
      newComponent = {
        ...component,
        standardCollectAbility: valueToUpdate === true ? newSCA : {},
        [name]: valueToUpdate
      };
    } else {
      newComponent = {
        ...component,
        [name]: valueToUpdate
      };
    }
    this.setState({component: newComponent});
    showComponentJSON(newComponent);
  }

  handleFormChangeByName = (name, valueToUpdate) => {
    const { showComponentJSON } = this.props;
    const { component } = this.state;
    let newComponent = {
      ...component,
      [name]: valueToUpdate
    }
    this.setState({component: newComponent});
    showComponentJSON(newComponent);
  }

  render() {
    const { onReset, onSave } = this.props;
    const { component } = this.state;
    const componentsType = JSON.parse(JSON.stringify(COMPONENTS_TYPE));

    return (
      <div className="formPanel">
        {component && 
          <form>
            <Form.Group controlId="ComponentSettingsForm">
              <InputGroup className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text id="componentName">Component Name</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  placeholder="Name"
                  name="componentName"
                  value={component.componentName}
                  onChange={this.handleFormChange}
                />
              </InputGroup>

              <div className="mb-3">
                {componentsType.map((type) => (
                  <Form.Check inline type="radio" name="componentType"
                    key={'editor'+type.id} id={'editor'+type.id} value={type.id} label={type.name}
                    checked={component.componentType === type.id}
                    onChange={this.handleFormChange}
                  />
                ))}
              </div>

              <InputGroup className="mb-3">
                <Form.Check inline type="checkbox" name="hasStandardCollectAbility"
                  id="hasStandardCollectAbility" label="Has standard collect ability"
                  value={component.hasStandardCollectAbility}
                  checked={component.hasStandardCollectAbility}
                  onChange={this.handleFormChange}/>
              </InputGroup>

              { component.hasStandardCollectAbility ?
                <EssencePanel className="mb-3"
                  hasStandardCollectAbility={component.hasStandardCollectAbility}
                  standardCollectAbility={component.standardCollectAbility}
                  onChangeByName={this.handleFormChangeByName}
                /> : null
              }

              <InputGroup className="mb-3">
                <Form.Check inline type="checkbox" name="hasSpecificCollectAbility"
                  id="hasSpecificCollectAbility" label="Has specific collect ability"
                  value={component.hasSpecificCollectAbility}
                  checked={component.hasSpecificCollectAbility}
                  onChange={this.handleFormChange}/>
              </InputGroup>

              <ButtonToolbar>
                <Button variant="secondary" size="sm" onClick={onSave} disabled={!component.componentName.trim()}>Save</Button>
                <Button variant="secondary" size="sm" onClick={this.handleReset}>Reset</Button>
              </ButtonToolbar>
            </ Form.Group>
          </form>
        }
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    component: store.editor.component,
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

  clearCollectOptions = () => {
    let data = {...this.props.standardCollectAbility};
    for (var property in data.essenceList) {
      if (data.essenceList.hasOwnProperty(property)) {
          data.essenceList[property] = 0;
      }
    }
    this.props.onChangeByName('standardCollectAbility', data);
  }

  handleFormChange = (changeEvent) => {
    const { checked, name, value, type } = changeEvent.target;
    const valueToUpdate = type === 'checkbox' ? checked: value;
    let data = {...this.props.standardCollectAbility};
    data[name] = valueToUpdate;
    this.props.onChangeByName('standardCollectAbility', data);
  }

  decrement = (type) => {
    let data = {...this.props.standardCollectAbility};
    data.essenceList[type] = this.props.standardCollectAbility.essenceList[type] > 0 ? --this.props.standardCollectAbility.essenceList[type] : 0;
    this.props.onChangeByName('standardCollectAbility', data);
  }

  increment = (type) => {
    let data = {...this.props.standardCollectAbility};
    data.essenceList[type] = this.props.standardCollectAbility.essenceList[type] >= 0 ? ++this.props.standardCollectAbility.essenceList[type] : 1;
    this.props.onChangeByName('standardCollectAbility', data);
  }

  render() {
    const { hasStandardCollectAbility, standardCollectAbility } = this.props
    const essenceListFromProps = standardCollectAbility.essenceList;
    const essenceList = [ 'elan', 'life', 'calm', 'death', 'gold', 'any', 'anyButGold', 'anyButDeathGold'];
    const components = essenceList.map((type, index) => (
      <div className="essenceList" key={index} >
        <InputGroup.Prepend >
          <Button variant="secondary" id={'raise'+type+'Essence'}
           onClick={() => this.decrement(type)}><span>-</span></Button>
        </InputGroup.Prepend>
          <InputGroup.Prepend>
            <InputGroup.Text className={"help-card-min "+type} id={type+'Essence'}>{essenceListFromProps[type]}</InputGroup.Text>
          </InputGroup.Prepend>
        <InputGroup.Append>
          <Button variant="secondary" id={'lower'+type+'CollectOptions'}
           onClick={() => this.increment(type)}><span>+</span></Button>
        </InputGroup.Append>
      </div>
    ));
    return (
      <div>
        { hasStandardCollectAbility ===true ?
          <div>
            <div className="mb-3">
              <Button variant="secondary" id={'clearCollectOptions'} size="sm"
                onClick={(e) => this.clearCollectOptions()}><span>Reset</span></Button>
            </div>
            <div className="mb-3">
              {components}
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Check inline type="checkbox" name="multipleCollectOptions"
                  id="multipleCollectOptions" label="Choose one"
                  value={standardCollectAbility.multipleCollectOptions}
                  checked={standardCollectAbility.multipleCollectOptions}
                  onChange={(e) => this.handleFormChange(e)}/>
              </InputGroup>
            </div>
          </div>
          : <div></div>
        }
      </div> );
  }
}
