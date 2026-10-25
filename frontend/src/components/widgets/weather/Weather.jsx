import React, { Component } from 'react';
import axios from 'axios'
import './Weather.css'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from '../../common/PlacesAutocomplete';
import WeatherIcon from './WeatherIcon'
import { Scrollbars } from '../../common/Scrollbars';
import {weatherCheck1,weatherCheck2,weatherCheck3,weatherCheck4,weatherCheck5} from '../../../logic/logic'
export default class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      weather: [],
      toggle: false,
	  day: {},
	  input:"",
	  miniSettings:false,
    };
  }

  //changes the location?
  handleChange = address => { this.setState({ address }) };

  handleSelect = address => {
    geocodeByAddress(address).then(results => getLatLng(results[0])).then(latLng => {
      let lat = latLng.lat
      let lng = latLng.lng
      axios.post('/api/weather', { lat, lng }).then(res => {
        this.setState({ weather: res.data.daily.data });
      })
    })
  };

  dayoftheweek(val) {
    let str = ""
    if (val === 0) { str = "Sunday" }
    else if (val === 1) { str = "Monday" }
    else if (val === 2) { str = "Tuesday" }
    else if (val === 3) { str = "Wedsday" }
    else if (val === 4) { str = "Thursday" }
    else if (val === 5) { str = "Friday" }
    else if (val === 6) { str = "Saturday" }
    else if (val === 6) { str = "Saturday" }
    return str;
  }

  weather() {
    let display = []
    const { weather } = this.state
    let day = new Date()
    for (let i = 0; i < weather.length; i++) {
      let iconz = weather[i].icon.toUpperCase();
      iconz = iconz.replace(/-/g, '_');
      let current = this.dayoftheweek(day.getDay())
      display.push(
        <div className='card' key={i} onClick={() => this.setDay(i, current, iconz)}>
          <p>{current}</p>
          <div >
            <WeatherIcon color='white' icon={iconz} />
          </div>
          <p>{weather[i].apparentTemperatureHigh}°F</p>
          <p>{weather[i].apparentTemperatureLow}°F</p>
          {/* <p>{weather[i].summary}</p> */}
        </div>)
      day.setDate(day.getDate() + 1);
    }
    return display
  }

  setDay(i, day, iconz) {
    let obj = { ind: i, day: day, icon: iconz }
    this.setState({ day: obj, toggle: true })
  }

  unset() { this.setState({ toggle: false }) }

  //detailed view
  deatailed() {
    const { day, weather } = this.state
    let ind = day.ind;
    return (<div>
      <div>
        <button className="back-button" onClick={() => this.unset()}><i className="fas fa-caret-left"></i></button>
        <p>{day.day}</p>
        <div ><WeatherIcon color='white' icon={day.icon} /></div>
        <p>High: {weather[ind].apparentTemperatureHigh}°F</p>
        <p>Low: {weather[ind].apparentTemperatureLow}°F</p>
        <p>{weather[ind].summary}</p>
        <p>humidity:{weather[ind].humidity}</p>
        <p>precipitation:{weather[ind].precipType}</p>
        <p>probablility{weather[ind].precipProbability}</p>
        <p>windSpeed:{weather[ind].windSpeed}</p>
        <p>windGust:{weather[ind].windGust}</p>
        <p>visibility:{weather[ind].visibility}</p>
      </div>
    </div>)
  }
  toggleSettings() {
		this.setState({ miniSettings: !this.state.miniSettings })
    axios.put(`/widget/settings/${this.props.o.master_id}`, {
      o1: null,
      o2: null,
      o3: null,
      o4: null,
      o5: null,
      o6: null,
    }).then(this.props.updateWidgets())
  }

  render() {
	const {miniSettings} = this.state
    return (
      <div className="standard-widget weather">
      {weatherCheck1(this.props.x)}
			{weatherCheck2(this.props.y)}
			{weatherCheck3(this.props.w)}
			{weatherCheck4(this.props.h)}
			{weatherCheck5(this.props.master_id)}
	  <Scrollbars>
		<button className="widget-settings-button" onClick={() => this.toggleSettings()}>•••</button>
    	{miniSettings ?
		<PlacesAutocomplete
          value={this.state.address}
          onChange={this.handleChange}
          onSelect={this.handleSelect}
        >

          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div  className="widget-settings">
              <input style={{marginTop: '50px'}} {...getInputProps({ placeholder: 'Search Places ...', className: 'location-search-input', })} />

              <div className="autocomplete-dropdown-container">
                {/* loading text */}
                {loading && <div>Loading...</div>}

                {/* location suggestions box */}
                {suggestions.map(suggestion => {
                  const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';

                  // inline style for demonstration purpose
                  const style = suggestion.active ? { backgroundColor: '#fafafa', color: 'black', cursor: 'pointer' } : { backgroundColor: 'white', color: 'black', cursor: 'pointer' };
                  return (
                    <div key={suggestion.placeId} {...getSuggestionItemProps(suggestion, { className, style })}>
                      <span>{suggestion.description}</span>
                    </div>
                  );
                })}

              </div>

            </div>
          )}
        </PlacesAutocomplete>
		:
        <div style={{marginTop: '40px'}} className='view'>
          {this.state.day.ind >= 0 && this.state.toggle === true ? this.deatailed() : this.weather()}
		</div>}
		</Scrollbars>
      <div className="theme-glow"></div>
			<div className="theme-accent"><i className="fas fa-arrows-alt"></i></div>
      </div>
    );
  }
}
