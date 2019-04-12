import React, { Component } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap'
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
    if(isUser){
      this.setError("User name taken");
    }else{
      this.setError("");
      this.props.setUser(user);
    }
  }

  render() {
    const { error, nickname } = this.state;
    return (
      <Form inline onSubmit={this.handleSubmit}>
        <FormControl
          className="mr-sm-2"
          size="sm"
          type="text"
          placeholder="Username"
          name="nickname"
          value={nickname}
          onChange={this.handleChange}/>
        <div className="error">
          {error ? error:null}
        </div>
        <Button size="sm" type="submit">Connect</Button>
      </Form>
    )
  }
}
