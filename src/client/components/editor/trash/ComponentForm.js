import React, { Component } from 'react'
import { Button, ButtonToolbar, Form, InputGroup} from 'react-bootstrap'
import { COMPONENTS_TYPE } from './EditorConstants'
import './Form.css';

export default class ComponentForm extends Component {
  createEvent(a,b,c,d) {
    return {
      target: {
        checked: a,
        name: b,
        value: c,
        type: d
      }
    };
  }

  render() {
    const componentsType = JSON.parse(JSON.stringify(COMPONENTS_TYPE));

    return (
      <div className="formPanel">
        <form>
          <InputGroup className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Text id="componentName">Component Name</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              placeholder="Name"
              name="componentName"
              value={this.props.component.componentName}
              onChange={this.props.onChange}
            />
          </InputGroup>

          <div className="mb-3">
            {componentsType.map((type, index) => (
              <Form.Check inline type="radio" name="componentType"
                key={index} id={type.id} value={type.id} label={type.name}
                checked={this.props.component.componentType === type.id}
                onChange={this.props.onChange}
              />
            ))}
          </div>

          <InputGroup className="mb-3">
            <Form.Check inline type="checkbox" name="hasStandardCollectAbility"
              id="hasStandardCollectAbility" label="Has standard collect ability"
              value={this.props.component.hasStandardCollectAbility}
              checked={this.props.component.hasStandardCollectAbility}
              onChange={this.props.onChange}/>
          </InputGroup>

          { this.props.component.hasStandardCollectAbility ?
            <EssencePanel className="mb-3"
              hasStandardCollectAbility={this.props.component.hasStandardCollectAbility}
              standardCollectAbility={this.props.component.standardCollectAbility}
              onChangeByName={this.props.onChangeByName}
             /> : null
           }

          <InputGroup className="mb-3">
            <Form.Check inline type="checkbox" name="hasSpecificCollectAbility"
              id="hasSpecificCollectAbility" label="Has specific collect ability"
              value={this.props.component.hasSpecificCollectAbility}
              checked={this.props.component.hasSpecificCollectAbility}
              onChange={this.props.onChange}/>
          </InputGroup>

          <ButtonToolbar>
            <Button variant="secondary" onClick={this.props.onSave}>Save to LocalStorage</Button>
            <Button variant="secondary" onClick={this.props.onDelete}>Delete</Button>
          </ButtonToolbar>
        </form>
      </div>
    );
  }
}

class EssencePanel extends Component {
  constructor(props) {
    super(props);
    this.clearCollectOptions = this.clearCollectOptions.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.decrement = this.decrement.bind(this);
    this.increment = this.increment.bind(this);
  }

  clearCollectOptions() {
    let data = {...this.props.standardCollectAbility};
    for (var property in data.essenceList) {
      if (data.essenceList.hasOwnProperty(property)) {
          data.essenceList[property] = 0;
      }
    }
    this.props.onChangeByName('standardCollectAbility', data);
  }

  handleFormChange(changeEvent) {
    const { checked, name, value, type } = changeEvent.target;
    const valueToUpdate = type === 'checkbox' ? checked: value;
    let data = {...this.props.standardCollectAbility};
    data[name] = valueToUpdate;
    this.props.onChangeByName('standardCollectAbility', data);
  }

  decrement(type) {
    let data = {...this.props.standardCollectAbility};
    data.essenceList[type] = this.props.standardCollectAbility.essenceList[type] > 0 ? --this.props.standardCollectAbility.essenceList[type] : 0;
    this.props.onChangeByName('standardCollectAbility', data);
  }

  increment(type) {
    let data = {...this.props.standardCollectAbility};
    data.essenceList[type] = this.props.standardCollectAbility.essenceList[type] >= 0 ? ++this.props.standardCollectAbility.essenceList[type] : 1;
    this.props.onChangeByName('standardCollectAbility', data);
  }

  render() {
    const essenceListFromProps = this.props.standardCollectAbility.essenceList;
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
        { this.props.hasStandardCollectAbility ===true ?
          <div>
            <div className="mb-3">
              <Button variant="secondary" id={'clearCollectOptions'}
                onClick={(e) => this.clearCollectOptions()}><span>Reset</span></Button>
            </div>
            <div className="mb-3">
              {components}
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Check inline type="checkbox" name="multipleCollectOptions"
                  id="multipleCollectOptions" label="Choose one"
                  value={this.props.standardCollectAbility.multipleCollectOptions}
                  checked={this.props.standardCollectAbility.multipleCollectOptions}
                  onChange={(e) => this.handleFormChange(e)}/>
              </InputGroup>
            </div>
          </div>
          : <div></div>
        }
      </div> );
  }
}
