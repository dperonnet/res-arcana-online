import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { Col, Container, Row } from 'react-bootstrap'
import { DEFAULT_COMPONENT } from './EditorConstants'
import ComponentForm from './ComponentForm'
import DatabaseContent from './DatabaseContent'
import CardZoom from '../common/card/CardZoom.js'
import './editor.scss'
import '../play/game/essence.scss'
import { connect } from 'react-redux'
import { deleteComponent, saveComponent } from '../../../store/actions/editorActions'
import ActionPower from '../common/power/ActionPower'

const COMPONENTS_STYLES = {
  artefact: 'card',
  backArtefact: 'card',
  backMonument: 'card',
  backMage: 'card',
  mage: 'card',
  magicItem: 'magic-item',
  monument: 'card',
  placeOfPower: 'place-of-power',
}

class DatabaseEditor extends Component {
  handleSelect = event => {
    const { components, selectComponent } = this.props
    const { value } = event.target
    const selectedComponent = JSON.parse(
      JSON.stringify(value !== '' && components[value] ? components[value] : DEFAULT_COMPONENT)
    )
    selectComponent(selectedComponent)
  }

  handleCreate = () => {
    const { selectComponent } = this.props
    const newComponent = JSON.parse(JSON.stringify(DEFAULT_COMPONENT))
    selectComponent(newComponent)
  }

  handleDelete = () => {
    const { deleteComponent } = this.props
    deleteComponent()
  }

  handleSave = () => {
    const { component, saveComponent } = this.props
    saveComponent(component)
  }

  handleReset = () => {
    this.props.resetComponent()
  }

  getJsonFromObject = object => JSON.stringify(object, undefined, 2)

  render() {
    const { auth, component, pristineComponent, profile } = this.props
    const jsonComponent = this.getJsonFromObject(component)

    if (!auth.uid || profile.role !== 'admin') return <Redirect to="/signIn" />

    let card
    if (pristineComponent && pristineComponent.class) {
      try {
        const src = require('../../assets/image/components/' +
          pristineComponent.type +
          '/' +
          pristineComponent.class +
          '.jpg')
        card = (
          <div className={'card-zoom-frame ' + COMPONENTS_STYLES[component.type]}>
            <CardZoom src={src} alt={pristineComponent.name ? pristineComponent.name : null} />
          </div>
        )
      } catch (err) {
        card = <div>No file found for {pristineComponent.class}.jpg</div>
      }
    }

    let actions =
      component.actionPowerList &&
      component.actionPowerList.map((action, index) => {
        return <ActionPower key={index} component={component} action={action} index={index}></ActionPower>
      })

    return (
      <Container className="editor-container">
        <div className="editor">
          <div className="main-section">
            <Row className="flex-row">
              <Col xs="12" md="6" className="flex-col">
                <h2>Database Editor</h2>
                <DatabaseContent
                  onSelect={this.handleSelect}
                  onCreate={this.handleCreate}
                  onDelete={this.handleDelete}
                />
                <h2>Component settings</h2>
                <ComponentForm onSave={this.handleSave} onReset={this.handleReset} />
              </Col>
              <Col xs="12" md="6" className="flex-col">
                <h2>Component datas</h2>
                <pre className="form-panel scrollable">{jsonComponent}</pre>
              </Col>
            </Row>
          </div>
          <div className="side-section">
            {card}
            <div className="action-renderer">{actions}</div>
          </div>
        </div>
      </Container>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    components: state.firestore.data.components,
    component: state.editor.component,
    filter: state.editor.filter,
    pristineComponent: state.editor.pristineComponent,
    profile: state.firebase.profile,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    deleteComponent: () => dispatch(deleteComponent()),
    saveComponent: component => dispatch(saveComponent(component)),
    selectComponent: component => dispatch({ type: 'SELECT_COMPONENT_TO_EDIT', component }),
    resetComponent: () => dispatch({ type: 'RESET_COMPONENT' }),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatabaseEditor)
