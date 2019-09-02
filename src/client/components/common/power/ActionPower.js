import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlash } from '@fortawesome/free-solid-svg-icons';
import './power.scss';

export default class ActionPower extends Component {
  
  renderEssenceList = (essenceList, cost, slash, plus, modifier) => {
    return essenceList && essenceList.map((essence, index) => {
      let classModifier = modifier && essence && essence.quantity ? ' modifier' : ''
      let signModifier = modifier && essence && essence.quantity > 0 ? '+' : ''
      let isLast = index === essenceList.length -1
      return <div key={essence.type} className={'icons '}>
        <div className={'essence sm ' + essence.type + classModifier}>
        {cost && <div className="cost"></div>}
        {signModifier}{(essence.quantity > 1) || (essence.quantity < 0) ? essence.quantity : ''}</div>
        {plus && !isLast && <div className="operator mt-n2 mr-0 ml-0">+</div>}
        {slash && !isLast && <div className="operator mt-n2">
          <FontAwesomeIcon icon={faSlash} size="xs" rotation={80} />
        </div>}
      </div>
    })
  }
  renderCostEssenceList = (essenceList, slash) => {
    return this.renderEssenceList(essenceList, true, slash, !slash)
  }
  
  renderGainEssenceList = (essenceList, modifier) => {
     return this.renderEssenceList(essenceList, false, false, true, modifier)
  }
  
  renderActionCost = (action) => {
    let essencePrefix = action.cost.essenceList && Object.keys(action.cost).filter((key) => key.startsWith('turn')).length > 0
    let essences = this.renderCostEssenceList(action.cost.essenceList, action.cost.multipleCostOptions)

    return <>
      {action.cost.turn && <div className="icon turn-component-icon"></div>}
      {action.cost.turnDragon && <>
        {action.cost.turn && <>+</>}
        <div className="icon turn-dragon-icon ml-1"></div>
      </>}
      {action.cost.turnCreature && <>
        {action.cost.turn && <>+</>}
        <div className="icon turn-creature-icon ml-1"></div>
      </>}
      {essencePrefix && <>+</>}{essences}
      {action.cost.onComponent && <><div className="action-text">on</div><div className="icon on-component-icon"></div></>}
      {action.cost.sameType && <>+ <div className="essence sm any-same-type"><div className="cost"></div></div></>}
      {action.cost.destroySelf && <>
        <div className="action-text">Destroy</div>
        <div className="icon on-component-icon"></div>
      </>}
      {action.cost.destroyOneArtefact && <>+
        <div className="action-text max-85">destroy <i>any one</i> of your artifacts</div>
      </>}
      {action.cost.destroyAnotherArtefact && <>+
        <div className="action-text max-85">destroy <i>another</i> of your artifacts</div>
      </>}
      {action.cost.destroyOneDragonOrCreature && <>+
        <div className="action-text">destroy one of your <i>dragons</i> or <i>creatures</i></div>
      </>}
      {action.cost.discardArtefact && <>
        +<div className="action-text max-60">discard a card</div>
      </>}
    </>
  }

  renderActionGain = (action) => {
    let essences = this.renderGainEssenceList(action.gain.essenceList)
    let rivalsGainPrefix = action.gain.rivalsGain
    let rivalsGainEssences = this.renderGainEssenceList(action.gain.rivalsGainEssenceList)
    let modifierList = this.renderGainEssenceList(action.gain.modifierList, true)

    return <>
      {action.gain.straightenComponent && <div className="icon straighten-component-icon"></div>}
      {action.gain.straightenSelf && <div className="icon straighten-self-icon"></div>}
      {action.gain.straightenCreature && <div className="icon straighten-creature-icon"></div>}
      {essences}
      {rivalsGainPrefix && <div className="action-text">+ all rivals gain</div>}{rivalsGainEssences}
      {action.gain.rivalsLoseLife > 0 && <>
        <div className="action-text">all rivals</div>
        <div className="icon essence sm life-loss">{action.gain.rivalsLoseLife > 1 ? action.gain.rivalsLoseLife : ''}</div>
      </>}
      {action.gain.checkVictoryNow && <div className="action-text">check vitory now!</div>}
      {action.gain.drawOne && <div className="action-text">draw <span className="large">1</span> card</div>}
      {action.gain.drawThreeDiscardThree && <div className="action-text max-125">draw <span className="large">3</span> cards, add to hand, discard <span className="large">3</span></div>}
      {action.gain.reorderThree > 0 && <div className="action-text">draw <span className="large">3</span> cards, reorder, put back <i>(may also use on Monument deck)</i></div>}
      {action.gain.onComponent && <><div className="action-text mr-1">on</div><div className="icon on-component-icon"></div></>}
      {action.cost.onlyWhenTurned && <div className="action-text max-95">(When this card is turned)</div>}
      {action.gain.putItOnAnyComponent && <><div className="action-text max-60">put the essence spent on</div><div className="icon component-icon"></div></>}
      {action.gain.putItOnComponent && <><div className="action-text">put it on</div><div className="icon on-component-icon"></div></>}
      {action.gain.placeArtefactFromDiscard && <>
        <div className="action-text max-75">place one of <i>your</i> discards at</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
        {modifierList}
      </>}
      {action.gain.powerCostAsGold && <div className="icon essence sm gold"><div className="qm"></div></div>}
      {action.gain.powerCostAsAnySameTypeButGold && <div className="essence sm any-same-type-but-gold"></div>}
      {action.gain.placementCostAsGold && <>
        <div className="action-text">gain</div>
        <div className="icon placement-cost-icon max-95"><div className="qm-dark"></div></div>
        <div className="action-text">in</div>
        <div className="essence gold"></div>
        </>}
      {action.gain.placementCostAsAnyButGold && <>
        <div className="action-text">gain</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
        <div className="action-text">in</div>
        {modifierList}
      </>}
      {action.gain.placeDragonForFree && <>
        <div className="action-text mr-1">Place</div>
        <div className="icon dragon-icon"></div>
        <div className="action-text ml-1 mr-1">at</div>
        <div className="icon placement-cost-icon"><div className="zero">0</div></div>
      </>}
      {action.gain.placeDragon && <>
        <div className="action-text mr-1">Place</div>
        <div className="icon dragon-icon"></div>
        <div className="action-text ml-1 mr-1">at</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
        {modifierList}
      </>}
      {action.gain.asManyCalmThanRivalsElan && <>
        <div className="action-text">Gain</div>
        <div className="essence sm calm"><div className="qm"></div></div>
        <div className="action-text">equal to</div>
        <div className="essence sm elan"><div className="qm"></div></div>
        <div className="action-text">of one rival</div>
      </>}
      {action.gain.asManyElanThanRivalsDeath && <>
        <div className="action-text">Gain</div>
        <div className="essence sm elan"><div className="qm"></div></div>
        <div className="action-text">equal to</div>
        <div className="essence sm death"><div className="qm"></div></div>
        <div className="action-text">of one rival</div>
      </>}
      {action.gain.placeDragonFromAnyDiscardPile && <>
        <div className="action-text">Place</div>
        <div className="icon dragon-icon"></div>
        <div className="action-text max-95">from <i>any</i> player's discard pile at</div>
        <div className="icon placement-cost-icon"><div className="qm-dark"></div></div>
      </>}
      
    </>
  }

  render() {
    let { component, action, index, onClick } = this.props
    let cost = this.renderActionCost(action)
    let gain = this.renderActionGain(action)
    let color = component.type === 'placeOfPower' ? ' place-of-power-action': ''

    return <div className={'component-action position-'+index + color} onClick={onClick}>
      <div className="action-cost-part">{cost}</div>
      <div className="icon gain-icon"></div>
      <div className="action-gain-part">{gain}</div>
    </div>
  }
}
