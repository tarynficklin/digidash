import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import axios from 'axios'
import marker from './Map-Marker-Marker-Outside-Chartreuse.png'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from '../../common/PlacesAutocomplete';
const AnyReactComponent = ({ img }) => <div>{img}</div>;

class Restaurants extends Component {
    constructor() {
        super()
        this.state = {
            address: '',
            locations: [],
            toggle: false
        }
    }
    static defaultProps = {
        center: {
            lat: 40.23,
            lng: -111.65
        },
        zoom: 11
    };
    handleChange = address => { this.setState({ address }) };

    handleSelect = address => {
        geocodeByAddress(address).then(results => getLatLng(results[0])).then(latLng => {
            var lat = latLng.lat
            var lng = latLng.lng
            axios.post('/api/getplaces', { lat, lng }).then(res => {
                console.log(res.data.results)
                this.setState({
                    locations: res.data.results,
                    toggle: true
                });
            })
        })
    };
    getLocations(map, maps) {
        let display = [];
        for (let i = 0; i < this.state.locations.length; i++) {
            const { lat, lng } = this.state.locations[i].geometry.location
            let myLatLng = { lat, lng }
            const { name } = this.state.locations[i].geometry
            display.push(new maps.Marker({
                position: myLatLng,
                map,
                title: name
            })

            )
        }
        console.log(display)
        return display
    }

    render() {
        const REACT_APP_GOOGLE = import.meta.env.REACT_APP_GOOGLE

        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                    <PlacesAutocomplete
                        value={this.state.address}
                        onChange={this.handleChange}
                        onSelect={this.handleSelect}
                    >

                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                            <div className="widget-settings">
                                <input style={{ marginTop: '50px' }} {...getInputProps({ placeholder: 'Search Places ...', className: 'location-search-input', })} />

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
                </div>
                <div >
                    {this.state.toggle ?
                        <div style={{ height: '90vh', width: '160vh', position: 'relative' }}>
                            <GoogleMapReact
                                bootstrapURLKeys={{ key: REACT_APP_GOOGLE }}
                                defaultCenter={this.props.center}
                                defaultZoom={this.props.zoom}
                                yesIWantToUseGoogleMapApiInternals
                                onGoogleApiLoaded={({ map, maps }) => this.getLocations(map, maps)}
                            >


                            </GoogleMapReact>
                            <button onClick={() => this.getthethings()}>the things</button>
                        </div>
                        :
                        <p>select a location</p>
                    }
                </div>
            </div>
        );
    }
}

export default Restaurants;