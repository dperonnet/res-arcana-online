import React, { Component, useRef } from 'react'
import '../assets/style/form.css';
import AddComponentForm from './AddComponentForm'
import { Button, ButtonToolbar, Col, Container, Form, Row} from 'react-bootstrap'
import RADatabase from '../RADatabase.json';

export default class DatabaseEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentComponent: JSON.parse(JSON.stringify(DEFAULT_COMPONENT)),
      selectedComponent: "",
      jsonDatabase: RADatabase
    };
  }

  selectComponent = (changeEvent) => {
    const { value } = changeEvent.target;
    const cursor = value.split(DELIMITER);
    const currentComponent = value ? this.state.jsonDatabase[cursor[0]+'List'].filter((item) => {
      return item.componentName === cursor[1]
    })[0]
     : JSON.parse(JSON.stringify(DEFAULT_COMPONENT));
    const newCurrentComponent = JSON.parse(JSON.stringify(currentComponent));
    this.setState({selectedComponent: value, currentComponent: newCurrentComponent});
  }

  handleFormChange = (changeEvent) => {
    const { checked, name, value, type } = changeEvent.target;
    const valueToUpdate = type === 'checkbox' ? checked: value;
    if (name === 'hasStandardCollectAbility') {
      const newSCA = JSON.parse(JSON.stringify(DEFAULT_STANDARD_COLLECT_ABILITY));
        this.setState({currentComponent: {
          ...this.state.currentComponent,
          standardCollectAbility: valueToUpdate === true ? newSCA : {},
          [name]: valueToUpdate,
        }});
    } else {
      this.setState({currentComponent: {
        ...this.state.currentComponent,
        [name]: valueToUpdate,
      }});
    }
  }

  handleFormChangeByName = (name, valueToUpdate) => {
    this.setState({currentComponent: {
      ...this.state.currentComponent,
      [name]: valueToUpdate,
    }});
  }

  clearLocalStorage = (changeEvent) => {
    console.log('clearLocalStorage SUCCESS');
    window.localStorage.removeItem(LOCALSTORAGE_KEY);
    this.loadJsonDatabase();
    this.selectComponent(changeEvent);
  }

  loadJsonDatabase = () => {
    const localStorageDatabase =  window.localStorage.getItem(LOCALSTORAGE_KEY);
    const raDatabase = JSON.stringify(RADatabase, null, 2);
    if (localStorageDatabase && localStorageDatabase.length > 0) {
      this.setState({...this.state.jsonDatabase,
        jsonDatabase: JSON.parse(localStorageDatabase)});
      console.log('localStorageDatabase loaded');
    } else {
      this.setState({...this.state.jsonDatabase,
        jsonDatabase: JSON.parse(raDatabase)});
      console.log('RADatabase loaded');
    }
  }

  getJsonFromObject = (object) => {
    return JSON.stringify(object, undefined, 2);
  }

  saveToLocalStorage = () => {
    const currentComponent = this.state.currentComponent;
    const jsonDatabase = this.state.jsonDatabase;
    const typeKey = currentComponent.componentType + 'List';
    const cible = jsonDatabase[typeKey].findIndex((item) => {
      return item.componentName === currentComponent.componentName
    });
    if (cible >= 0) {
      jsonDatabase[typeKey].splice(cible, 1, currentComponent);
    } else {
      jsonDatabase[typeKey].push(currentComponent);
    }

    const validJson = JSON.stringify(jsonDatabase, null, 2);
    if (!validJson) {
      console.log('saveToLocalStorage FAIL');
      return;
    } else {
      window.localStorage.setItem(LOCALSTORAGE_KEY, validJson);
      this.setState({...this.state.jsonDatabase,
        jsonDatabase: JSON.parse(validJson)});
      console.log('saveToLocalStorage SUCCESS');
    }
  }

  deleteFromLocalStorage = () => {
    const currentComponent = this.state.currentComponent;
    const jsonDatabase = this.state.jsonDatabase;
    const cible = jsonDatabase[currentComponent.componentType+'List'].findIndex((item) => {
      return item.componentName === currentComponent.componentName
    });
    if (cible >= 0) {
      console.log('deleteFromLocalStorage SUCCESS');
      jsonDatabase[currentComponent.componentType+'List'].splice(cible, 1);
      const validJson = JSON.stringify(jsonDatabase, null, 2);
      if (!validJson) {
        console.log('deleteFromLocalStorage FAIL');
        return;
      }
      window.localStorage.setItem(LOCALSTORAGE_KEY, validJson);
      this.setState({...this.state.jsonDatabase,
        jsonDatabase: JSON.parse(validJson)});
    } else {
        console.log('deleteFromLocalStorage FAIL');
    }
  }


  render() {
    const jsonDatabase = this.state.jsonDatabase;
    const current = this.state.currentComponent;
    const jsonCurrentComponent = this.getJsonFromObject(current);
    return (
      <Container className="formContainer">
        <Row>
          <Col>
            <Row>
              <Col>
                <h2>Database management</h2>
                <DatabaseContent
                  datas={jsonDatabase}
                  selected={this.state.selectedComponent}
                  onSelect={this.selectComponent}
                  onLoad={this.loadJsonDatabase}
                  onClear={this.clearLocalStorage}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <h2>Current component setting</h2>
                <AddComponentForm
                  component={current}
                  onChange={this.handleFormChange}
                  onChangeByName={this.handleFormChangeByName}
                  onSave={this.saveToLocalStorage}
                  onDelete={this.deleteFromLocalStorage}
                />
              </Col>
            </Row>
          </Col>
          <Col>
            <h2>Current component JSON</h2>
            <pre className="formPanel">
              {jsonCurrentComponent}
            </pre>
          </Col>
        </Row>
      </Container>
    );
  }
}

function TextInputWithFocusButton(data) {
  const parsedJsonDatabase = JSON.stringify(data);
  const onButtonClick = (e) => {
    const textField = document.createElement('textarea');
    textField.innerText = parsedJsonDatabase;
    const parentElement = e.target;
    parentElement.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    parentElement.removeChild(textField);
    e.target.focus();
  };

  return (
      <Button variant="secondary" onClick={onButtonClick}>Copy to clipboard</Button>
  );
}

class DatabaseContent extends Component {
  constructor(props) {
    super(props);
    this.getDatas = this.getDatas.bind(this);
  }

  getDatas(componentType, index1) {
    const datas = this.props.datas;
    return ( datas && datas.hasOwnProperty(componentType.id+'List') ?
      datas[componentType.id+'List'].map((component, index2) => {
        return (
          <option key={index1+'_'+index2} value={componentType.id + DELIMITER + component.componentName}>
            {componentType.name} - {component.componentName}
          </option>
        )
      }) : null
    );
  }

  render() {
    const options = COMPONENTS_TYPE.map((componentType, index) => {
        return this.getDatas(componentType, index);
    });

    return (
      <div className="formPanel">
        <Form.Group controlId="exampleForm.ControlSelect1">
          <Form.Label>Game Components</Form.Label>
          <Form.Control as="select" name="currentComponent" value={this.props.selected} onChange={(e) => this.props.onSelect(e)}>
            <option></option>
            {options}
          </Form.Control>
        </Form.Group>
        <ButtonToolbar>
          <Button variant="secondary" onClick={this.props.onLoad}>Reload Database</Button>
          <Button variant="secondary" onClick={this.props.clear}>Clear LocalStorage</Button>
          <TextInputWithFocusButton data={this.props.datas}/>
        </ButtonToolbar>
      </div>
    );
  }
}

const DELIMITER = '|';
const LOCALSTORAGE_KEY = 'RADatabase.json';

export const COMPONENTS_TYPE = [
  {id: "artefact", name:"Artefact"},
  {id: "mage", name:"Mage"},
  {id: "magicItem", name:"Magic Item"},
  {id: "monument", name:"Monument"},
  {id: "placeOfPower", name:"Place of Power"}
];

const DEFAULT_STANDARD_COLLECT_ABILITY = {
  multipleCollectOptions: false,
  essenceList: {
    elan: 0, life: 0, calm: 0, death: 0, gold: 0, any: 0, anyButGold: 0, anyButDeathGold: 0,
  }
};

const DEFAULT_COMPONENT = {
  componentName: "",
  componentType: "artefact",
  hasStandardCollectAbility: false,
  standardCollectAbility: {},
  hasSpecificCollectAbility: false,
  specificCollectAbility: "",
  isDragon: false,
  isCreature: false
};
