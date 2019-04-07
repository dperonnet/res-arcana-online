import React, { Component } from 'react';
import { Button, Col, InputGroup, Form, FormControl } from 'react-bootstrap'
import { VERIFY_USER } from '../../../../server/Events';

export default class LoginForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      nickname:"",
      error:""
    }
  }

  handleChange = (e)=>{
    this.setState({nickname: e.target.value});
  }

  handleSubmit = (e)=>{
    e.preventDefault();
    const { socket } = this.props;
    const { nickname } = this.state;
    socket.emit(VERIFY_USER, nickname, this.setUser);
  }

  setError = (error)=>{
    this.setState({error});
  }

  setUser = ({user, isUser})=>{
    console.log(user, isUser);
    if(isUser){
      this.setError("User name taken");
    }else{
      this.props.setUser(user);
        this.setError("");
    }
  }

  render() {
    const { error, nickname } = this.state;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Row>
          <Form.Group as={Col}>
            <InputGroup className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text id="nickname">Login</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                placeholder="Username"
                name="nickname"
                value={nickname}
                onChange={this.handleChange}
              />
              <Button type="submit">Connect</Button>
            </InputGroup>
            <div className="error">
              {error ? error:null}
            </div>
            </Form.Group>
        </Form.Row>
      </Form>
    )
  }
}
