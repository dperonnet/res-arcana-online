import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

class CardGenerator extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const componentsType = [
      {id: "artefact", name:"Artefact"},
      {id: "mage", name:"Mage"},
      {id: "magicItem", name:"Magic Item"},
      {id: "monument", name:"Monument"},
      {id: "placeOfPower", name:"Place of Power"}
    ];
    return (
      <form>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        <div className="mb-3">
          {componentsType.map((type, index) => (
          <Form.Check key={index} inline name="componentType" label={type.name} type="radio" id={type.id} />
          ))}
        </div>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="componentName">Component Name</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl placeholder="Name"/>
        </InputGroup>
      </form>
    );
  }
}

export default CardGenerator;
