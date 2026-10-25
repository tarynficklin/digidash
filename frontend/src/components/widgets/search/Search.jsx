import React, { Component } from 'react';
import './Search.css';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: 'https://www.google.com/search?q=', search: '' };
  }

  handleInput(val) {
    this.setState({ search: val });
  }
  keyPress(e) {
    if (e.keyCode === 13) {
      document.getElementById('searchButton').click();
    }
  }

  render() {
    return (
      <div className="search">
        <select onChange={(e) => this.setState({ selected: e.target.value })} placeholder="Google">
          <option value="https://www.google.com/search?q=">Google</option>
          <option value="https://search.yahoo.com/search?q=">Yahoo</option>
          <option value="https://www.bing.com/search?q=">Bing</option>
          <option value="https://duckduckgo.com/?q=">Duck Duck Go</option>
          <option value="https://search.aol.com/aol/search?q=">Netscape</option>
          <option value="https://en.wikipedia.org/w/index.php?search=">wikipedia</option>
        </select>
        <input
          onChange={(e) => this.handleInput(e.target.value)}
          onKeyDown={this.keyPress}
          className="theme-input"
        />
        <a
          href={`${this.state.selected}${this.state.search}`}
          target="_blank"
          id="searchButton"
          rel="noopener"
        >
          <button className="theme-text">Go</button>
        </a>
        <div className="theme-glow"></div>
        <div className="theme-accent" style={{ border: `none` }}>
          <i className="fas fa-arrows-alt"></i>
        </div>
      </div>
    );
  }
}

export default Search;
