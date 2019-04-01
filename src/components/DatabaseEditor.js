import React, { Component } from 'react'
import '../assets/style/form.css';
import AddComponentForm from './AddComponentForm'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

export default class DatabaseEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentComponent: {
        componentName: "Choupidoubidou",
        componentType: "mage",
        hasStandardCollectAbility: false,
        standardCollectAbility: {},
        hasSpecificCollectAbility: false,
        specificCollectAbility: "",
        isDragon: false,
        isCreature: false
      }
    };
  }

  handleFormChange = (changeEvent) => {
    const { checked, name, value, type } = changeEvent.target;
    const valueToUpdate = type === 'checkbox' ? checked: value;
    if (name === 'hasStandardCollectAbility') {
        this.setState({currentComponent: {
          ...this.state.currentComponent,
          standardCollectAbility: valueToUpdate === true ? JSON.parse(JSON.stringify(DEFAULT_STANDARD_COLLECT_ABILITY)) : {},
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

  toto(cible){

      this.setState((prevState) => {
        const res = prevState[cible] >= 0 ? ++prevState[cible] : 1;
        this.props.onChange(this.createEvent(null, cible, res, null));
        return {[cible]: res};
      });
  }

  getJson() {
    return JSON.stringify(this.state.currentComponent, undefined, 2);
  }

  render() {
    const current = this.state.currentComponent;
    const jsonCurrentComponent = this.getJson();
    return (
      <Container>
        <Row>
          <Col>
            <AddComponentForm
              component={current}
              onChange={this.handleFormChange}
              onChangeByName={this.handleFormChangeByName}
              onDelete={this.handleDeleteByName}
            />
          </Col>
          <Col>
            <pre  className="formPanel">
              {jsonCurrentComponent}
            </pre>
          </Col>
        </Row>
      </Container>
    );
  }
}

const DEFAULT_STANDARD_COLLECT_ABILITY = {
  multipleCollectOptions: false,
  essenceList: {
    elan: 0, life: 0, calm: 0, death: 0, gold: 0, any: 0, anyButGold: 0, anyButDeathGold: 0,
  }
};
