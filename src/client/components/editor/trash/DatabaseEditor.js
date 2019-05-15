import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import {
  DEFAULT_COMPONENT, DEFAULT_STANDARD_COLLECT_ABILITY, DELIMITER, LOCALSTORAGE_KEY
} from './EditorConstants';
import ComponentForm from './ComponentForm';
import DatabaseContent from './DatabaseContent';
import RADatabase from '../../RADatabase.json';
import './Form.css';

export default class DatabaseEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentComponent: JSON.parse(JSON.stringify(DEFAULT_COMPONENT)),
      selectedComponent: '',
      jsonDatabase: RADatabase
    };
  }

  selectComponent = (changeEvent) => {
    const { value } = changeEvent.target;
    const cursor = value.split(DELIMITER);
    const { jsonDatabase } = this.state;
    const currentComponent = value ? jsonDatabase[`${cursor[0]}List`].filter(item => item.componentName === cursor[1])[0]
      : JSON.parse(JSON.stringify(DEFAULT_COMPONENT));
    const newCurrentComponent = JSON.parse(JSON.stringify(currentComponent));
    this.setState({ selectedComponent: value, currentComponent: newCurrentComponent });
  }

  handleFormChange = (changeEvent) => {
    const {
      checked, name, value, type
    } = changeEvent.target;
    const { currentComponent } = this.state;
    const valueToUpdate = type === 'checkbox' ? checked : value;
    if (name === 'hasStandardCollectAbility') {
      const newSCA = JSON.parse(JSON.stringify(DEFAULT_STANDARD_COLLECT_ABILITY));
      this.setState({
        currentComponent: {
          ...currentComponent,
          standardCollectAbility: valueToUpdate === true ? newSCA : {},
          [name]: valueToUpdate,
        }
      });
    } else {
      this.setState({
        currentComponent: {
          ...currentComponent,
          [name]: valueToUpdate,
        }
      });
    }
  }

  handleFormChangeByName = (name, valueToUpdate) => {
    const { currentComponent } = this.state;
    this.setState({
      currentComponent: {
        ...currentComponent,
        [name]: valueToUpdate,
      }
    });
  }

  clearLocalStorage = (changeEvent) => {
    console.log('clearLocalStorage SUCCESS');
    window.localStorage.removeItem(LOCALSTORAGE_KEY);
    this.loadJsonDatabase();
    this.selectComponent(changeEvent);
  }

  loadJsonDatabase = () => {
    const localStorageDatabase = window.localStorage.getItem(LOCALSTORAGE_KEY);
    const raDatabase = JSON.stringify(RADatabase, null, 2);
    const { jsonDatabase } = this.state;
    if (localStorageDatabase && localStorageDatabase.length > 0) {
      this.setState({
        ...jsonDatabase,
        jsonDatabase: JSON.parse(localStorageDatabase)
      });
      console.log('localStorageDatabase loaded');
    } else {
      this.setState({
        ...jsonDatabase,
        jsonDatabase: JSON.parse(raDatabase)
      });
      console.log('RADatabase loaded');
    }
  }

  getJsonFromObject = object => JSON.stringify(object, undefined, 2)

  saveToLocalStorage = () => {
    const { currentComponent, jsonDatabase } = this.state;
    const typeKey = `${currentComponent.componentType}List`;
    const cible = jsonDatabase[typeKey].findIndex(
      item => item.componentName === currentComponent.componentName
    );
    if (cible >= 0) {
      jsonDatabase[typeKey].splice(cible, 1, currentComponent);
    } else {
      jsonDatabase[typeKey].push(currentComponent);
    }

    const validJson = JSON.stringify(jsonDatabase, null, 2);
    if (!validJson) {
      console.log('saveToLocalStorage FAIL');
      return;
    }
    window.localStorage.setItem(LOCALSTORAGE_KEY, validJson);
    this.setState({
      ...jsonDatabase,
      jsonDatabase: JSON.parse(validJson)
    });
    console.log('saveToLocalStorage SUCCESS');
  }

  deleteFromLocalStorage = () => {
    const { currentComponent, jsonDatabase } = this.state;
    const cible = jsonDatabase[`${currentComponent.componentType}List`].findIndex(item => item.componentName === currentComponent.componentName);
    if (cible >= 0) {
      console.log('deleteFromLocalStorage SUCCESS');
      jsonDatabase[`${currentComponent.componentType}List`].splice(cible, 1);
      const validJson = JSON.stringify(jsonDatabase, null, 2);
      if (!validJson) {
        console.log('deleteFromLocalStorage FAIL');
        return;
      }
      window.localStorage.setItem(LOCALSTORAGE_KEY, validJson);
      this.setState({
        ...jsonDatabase,
        jsonDatabase: JSON.parse(validJson)
      });
    } else {
      console.log('deleteFromLocalStorage FAIL');
    }
  }


  render() {
    const { currentComponent, jsonDatabase, selectedComponent } = this.state;
    const jsonCurrentComponent = this.getJsonFromObject(currentComponent);
    return (
      <Container>
        <div className="editor">
          <Row>
            <Col>
              <Row>
                <Col>
                  <h2>Database management</h2>
                  <DatabaseContent
                    datas={jsonDatabase}
                    selected={selectedComponent}
                    onSelect={this.selectComponent}
                    onLoad={this.loadJsonDatabase}
                    onClear={this.clearLocalStorage}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <h2>Current component setting</h2>
                  <ComponentForm
                    component={currentComponent}
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
        </div>
      </Container>
    );
  }
}
