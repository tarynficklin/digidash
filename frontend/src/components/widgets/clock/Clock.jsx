import React, { Component } from 'react';
import Clock from 'react-clock';
import ClockTheme from './ClockTheme';
import 'react-clock/dist/Clock.css';
import axios from 'axios';
import Digital from './Digital';
import './Clock.css';
import {
  clockCheck1,
  clockCheck2,
  clockCheck3,
  clockCheck4,
  clockCheck5,
} from '../../../logic/logic';

class WidgetClock extends Component {
  constructor(props) {
    super(props);
    const { o1 } = this.props.o;
    this.state = {
      miniSettings: false,
      show: o1 === 'true' ? true : false,
      date: new Date(),
    };
  }

  componentDidMount() {
    setInterval(() => this.setState({ date: new Date() }), 1000);
  }
  toggleSettings() {
    const { show } = this.state;
    this.setState({ miniSettings: !this.state.miniSettings });
    axios
      .put(`/widget/settings/${this.props.o.master_id}`, {
        o1: show,
        o2: null,
        o3: null,
        o4: null,
        o5: null,
        o6: null,
      })
      .then(this.props.updateWidgets());
  }
  toggle() {
    this.setState({ show: !this.state.show });
  }

  render() {
    const { show, miniSettings } = this.state;
    return (
      <div className="clock standard-widget">
        {clockCheck1(this.props.x)}
        {clockCheck2(this.props.y)}
        {clockCheck3(this.props.w)}
        {clockCheck4(this.props.h)}
        {clockCheck5(this.props.master_id)}

        <ClockTheme />
        <button className="widget-settings-button" onClick={() => this.toggleSettings()}>
          •••
        </button>

        {miniSettings ? (
          <div className="widget-settings">
            <div className="widget-settings-item">
              <div
                className={!this.state.show ? `checkbox checked theme-color` : `checkbox`}
                onClick={() => {
                  this.toggle();
                }}
              >
                <i className="fas fa-check"></i>
              </div>
              <a>Digital</a>
            </div>
          </div>
        ) : null}

        <div>{show ? <Clock value={this.state.date} size={125} /> : <Digital />}</div>
        <div className="theme-glow"></div>
        <div className="theme-accent">
          <i className="fas fa-arrows-alt"></i>
        </div>
      </div>
    );
  }
}

export default WidgetClock;
