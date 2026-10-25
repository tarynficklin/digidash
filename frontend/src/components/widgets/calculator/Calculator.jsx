import React, { Component } from 'react';
import CalculatorScreen from './CalculatorScreen';
import Button from './Button';
import {
  clickNumber,
  clickAllClear,
  clickClearEntry,
  clickOperation,
  clickPercentage,
  clickEqual,
} from './actions';
import './Calculator.css';

class Calculator extends Component {
  constructor() {
    super();

    this.handleClickNumber = this.handleClickNumber.bind(this);
    this.handleClickAllClear = this.handleClickAllClear.bind(this);
    this.handleClickClearEntry = this.handleClickClearEntry.bind(this);
    this.handleClickOperation = this.handleClickOperation.bind(this);
    this.handleClickPercentage = this.handleClickPercentage.bind(this);
    this.handleClickEqual = this.handleClickEqual.bind(this);

    this.state = {
      entry: '0',
    };
  }

  handleClickNumber(number) {
    this.setState(clickNumber.bind(null, number));
  }

  handleClickAllClear() {
    this.setState(clickAllClear);
  }

  handleClickClearEntry() {
    this.setState(clickClearEntry);
  }

  handleClickOperation(operation) {
    this.setState(clickOperation.bind(null, operation));
  }

  handleClickPercentage() {
    this.setState(clickPercentage);
  }

  handleClickEqual() {
    this.setState(clickEqual);
  }

  render() {
    return (
      <div className="calculator standard-widget">
        <div className="Calculator-container">
          <CalculatorScreen value={this.state.entry} />
          <Button value="AC" onClick={this.handleClickAllClear} />
          <Button value="CE" onClick={this.handleClickClearEntry} />
          <Button value="%" onClick={this.handleClickPercentage} />
          <Button value="/" onClick={this.handleClickOperation} />
          <Button value="7" onClick={this.handleClickNumber} />
          <Button value="8" onClick={this.handleClickNumber} />
          <Button value="9" onClick={this.handleClickNumber} />
          <Button value="x" onClick={this.handleClickOperation} />
          <Button value="4" onClick={this.handleClickNumber} />
          <Button value="5" onClick={this.handleClickNumber} />
          <Button value="6" onClick={this.handleClickNumber} />
          <Button value="-" onClick={this.handleClickOperation} />
          <Button value="1" onClick={this.handleClickNumber} />
          <Button value="2" onClick={this.handleClickNumber} />
          <Button value="3" onClick={this.handleClickNumber} />
          <Button
            className="Button-big"
            value="+"
            onClick={this.handleClickOperation}
          />
          <Button value="0" onClick={this.handleClickNumber} />
          <Button value="." onClick={this.handleClickNumber} />
          <Button value="=" onClick={this.handleClickEqual} />
        </div>
        
        <div className="theme-glow"></div>
        <div className="theme-accent"><i className="fas fa-arrows-alt"></i></div>
      </div>
    );
  }
}

export default Calculator;