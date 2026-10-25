import React, { Component } from 'react';
import { formatShortDate } from '../../../lib/time';
import './Bitcoin.css';
import BitCoinTheme from './BitCoinTheme';
import InfoBox from './InfoBox';
import LineChart from './LineChart';
import ToolTip from './ToolTip';

class Bitcoin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingData: true,
      data: null,
      hoverLoc: null,
      activePoint: null,
    };
  }
  handleChartHover(hoverLoc, activePoint) {
    this.setState({
      hoverLoc: hoverLoc,
      activePoint: activePoint,
    });
  }
  componentDidMount() {
    const getData = () => {
      const url = 'https://api.coindesk.com/v1/bpi/historical/close.json';

      fetch(url)
        .then((r) => r.json())
        .then((bitcoinData) => {
          const sortedData = [];
          let count = 0;
          for (const date in bitcoinData.bpi) {
            sortedData.push({
              d: formatShortDate(date),
              p: bitcoinData.bpi[date].toLocaleString('us-EN', {
                style: 'currency',
                currency: 'USD',
              }),
              x: count, //previous days
              y: bitcoinData.bpi[date], // numerical price
            });
            count++;
          }
          this.setState({
            data: sortedData,
            fetchingData: false,
          });
        })
        .catch((e) => {
          console.log(e);
        });
    };
    getData();
  }
  render() {
    return (
      <div className="bitcoin">
        <BitCoinTheme />
        <div className="row"></div>
        <div className="row">
          {!this.state.fetchingData ? <InfoBox data={this.state.data} /> : null}
        </div>
        <div className="row">
          <div className="popup">
            {this.state.hoverLoc ? (
              <ToolTip hoverLoc={this.state.hoverLoc} activePoint={this.state.activePoint} />
            ) : null}
          </div>
        </div>
        <div className="row">
          <div className="chart">
            {!this.state.fetchingData ? (
              <LineChart
                data={this.state.data}
                onChartHover={(a, b) => this.handleChartHover(a, b)}
              />
            ) : null}
          </div>
        </div>
        <div className="sponsor">
          <div id="coindesk">
            {' '}
            Powered by <a href="http://www.coindesk.com/price/">CoinDesk</a>
          </div>
        </div>
        <div className="theme-glow"></div>
        <div className="theme-accent">
          <i className="fas fa-arrows-alt"></i>
        </div>
      </div>
    );
  }
}

export default Bitcoin;
