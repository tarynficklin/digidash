// Replacement for react-places-autocomplete (last released 2020), keeping the
// same render-prop API the widgets use:
//
//   <PlacesAutocomplete value onChange onSelect>
//     {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => ...}
//   </PlacesAutocomplete>
//
// plus the geocodeByAddress / getLatLng helpers. Like the original, it relies
// on the Google Maps JavaScript API (with the places library) that index.html
// loads onto window.google.
import { useEffect, useRef, useState } from 'react';

const googleMaps = () => window.google?.maps;

export function geocodeByAddress(address) {
  return new Promise((resolve, reject) => {
    const maps = googleMaps();
    if (!maps) return reject(new Error('Google Maps JavaScript API is not loaded.'));
    new maps.Geocoder().geocode({ address }, (results, status) =>
      status === maps.GeocoderStatus.OK
        ? resolve(results)
        : reject(new Error(`Geocoding failed: ${status}`)),
    );
  });
}

export function getLatLng(result) {
  const { location } = result.geometry;
  return Promise.resolve({ lat: location.lat(), lng: location.lng() });
}

export default function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  debounce = 200,
  children,
}) {
  const [predictions, setPredictions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const service = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function clear() {
    clearTimeout(timer.current);
    setPredictions([]);
    setActiveIndex(-1);
    setLoading(false);
  }

  function fetchPredictions(input) {
    clearTimeout(timer.current);
    const maps = googleMaps();
    if (!input || !maps?.places) {
      if (input && !maps?.places)
        console.error('PlacesAutocomplete: Google Maps places library is not loaded.');
      return clear();
    }
    service.current ??= new maps.places.AutocompleteService();
    setLoading(true);
    timer.current = setTimeout(() => {
      service.current.getPlacePredictions({ input }, (results, status) => {
        setLoading(false);
        setActiveIndex(-1);
        const ok = status === maps.places.PlacesServiceStatus.OK && results;
        setPredictions(
          ok ? results.map((p) => ({ description: p.description, placeId: p.place_id })) : [],
        );
      });
    }, debounce);
  }

  function select(suggestion) {
    clear();
    onSelect?.(suggestion.description, suggestion.placeId, suggestion);
  }

  function handleKeyDown(event) {
    if (!predictions.length) {
      if (event.key === 'Enter') onSelect?.(value, null);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % predictions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? predictions.length - 1 : i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      select(predictions[activeIndex >= 0 ? activeIndex : 0]);
    } else if (event.key === 'Escape') {
      clear();
    }
  }

  const suggestions = predictions.map((p, index) => ({
    ...p,
    index,
    active: index === activeIndex,
  }));

  const getInputProps = (props = {}) => ({
    ...props,
    type: 'text',
    autoComplete: 'off',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': suggestions.length > 0,
    value,
    onChange: (event) => {
      onChange?.(event.target.value);
      fetchPredictions(event.target.value);
    },
    onKeyDown: handleKeyDown,
    onBlur: clear,
  });

  const getSuggestionItemProps = (suggestion, props = {}) => ({
    ...props,
    role: 'option',
    'aria-selected': suggestion.active,
    onMouseEnter: () => setActiveIndex(suggestion.index),
    // mousedown (not click) so the input's blur doesn't clear the list first
    onMouseDown: (event) => {
      event.preventDefault();
      select(suggestion);
    },
  });

  return children({ getInputProps, getSuggestionItemProps, suggestions, loading });
}
