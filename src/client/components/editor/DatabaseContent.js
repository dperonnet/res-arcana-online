import React, { Component } from 'react'
import { Button, ButtonToolbar, Form} from 'react-bootstrap'
import { COMPONENTS_TYPE, DELIMITER } from './EditorConstants.js'
import './Form.css';

export default class DatabaseContent extends Component {
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
