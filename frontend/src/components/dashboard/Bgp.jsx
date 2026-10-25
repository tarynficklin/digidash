import axios from 'axios';
import React, { Component } from 'react';
import './Bgp.css';
import { connect } from 'react-redux';
import { setBG, setColor, setTheme } from '../../ducks/reducer';
import { getPalette } from '../../lib/palette';
import LocalUploader from '../common/LocalUploader';
import { Scrollbars } from '../common/Scrollbars';

// Unsplash serves resized copies via query params; uploaded files are used as-is.
const sized = (url, params) => (url.includes('images.unsplash.com') ? `${url}&${params}` : url);

class Bgp extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imgs: [],
      showBig: false,
      selected: null,
      vibrant: {
        vibrant: null,
        muted: null,
        lightVibrant: null,
        lightMuted: null,
        darkVibrant: null,
        darkMuted: null,
      },
      image: null,
      color: null,
      theme: null,
    };
  }

  changeHandle = (e) => {
    this.setState({ input: e });
  };

  keyPress(e) {
    if (e.keyCode === 13) {
      document.getElementById('searchButton').click();
    }
  }

  // The API searches Unsplash with its own key (UNSPLASH_KEY in backend/.env).
  performSearch = (query = this.state.input) => {
    axios
      .get('/api/unsplash/search', { params: { query } })
      .then((res) => {
        this.setState({ imgs: res.data });
      })
      .catch((err) => {
        console.log('Error happened during fetching!', err);
      });
  };

  smallPicture() {
    this.setState({
      showBig: false,
      selected: null,
      image: null,
      color: null,
      theme: null,
    });
  }

  bigPicture(index, image) {
    this.setState({ showBig: true, selected: index, image });
    // Palette is computed in the browser now (was PUT /api/vibrant).
    getPalette(sized(image, 'auto=format&fit=crop&w=200&q=80'))
      .then((vibrant) => this.setState({ vibrant }))
      .catch((err) => console.log('Could not read colors from image', err));
  }

  // An uploaded file joins the thumbnails (same shape as an Unsplash result) and
  // opens in the preview, so it goes through the usual palette + Finalize flow.
  useUpload = ({ publicUrl }) => {
    const item = { urls: { raw: publicUrl, regular: publicUrl, small: publicUrl } };
    this.setState(
      (state) => ({ imgs: [item, ...state.imgs] }),
      () => this.bigPicture(0, publicUrl),
    );
  };

  chooseColor(color, theme) {
    this.setState({ color, theme });
  }

  changeTheme() {
    const { user_id, setTheme, setColor, setBG } = this.props;
    const { image, color, theme } = this.state;
    const newImage = sized(image, 'auto=format&fit=crop&w=1920&q=80');
    setTheme(theme);
    setColor(color);
    setBG(image);
    axios.put(`/api/unsplash/${user_id}`, { image: newImage, color, theme });
    this.props.bgPickerToggle();
    this.props.globalToggle();
  }

  render() {
    const { color } = this.state;
    const { vibrant, muted, lightVibrant, lightMuted, darkVibrant, darkMuted } = this.state.vibrant;
    return (
      <div className="bgp">
        {!this.state.showBig ? (
          <div className="header-wrapper">
            <div className="bgp-back" onClick={() => this.props.bgPickerToggle()}>
              <i className="fas fa-caret-left"></i>
              <a>Back</a>
            </div>
            <h1 className="bgp-header">Customize your background</h1>
            <div className="bgp-search theme-text">
              <input
                onChange={(e) => this.changeHandle(e.target.value)}
                type="text"
                onKeyDown={this.keyPress}
              />
              <button onClick={() => this.performSearch()} id="searchButton">
                <i className="fas fa-search"></i>
              </button>
              <LocalUploader
                onFinish={this.useUpload}
                onError={(message) => console.log('Upload failed:', message)}
              >
                <i className="fas fa-upload"></i>
              </LocalUploader>
            </div>
          </div>
        ) : null}

        <div className="bgp-images">
          {this.state.showBig ? (
            this.state.showBig ? (
              <div className="big-image-wrapper">
                <div className="bgp-back" onClick={() => this.smallPicture()}>
                  <i className="fas fa-caret-left"></i>
                  <a>Back</a>
                </div>
                <div
                  style={{
                    background: `url(${this.state.imgs[this.state.selected].urls.regular}) center`,
                    backgroundSize: `cover`,
                    borderRadius: `3px`,
                    height: `50%`,
                    width: `50%`,
                  }}
                ></div>
                <div className="vibrant-picker">
                  {vibrant ? (
                    <div
                      onClick={() => this.chooseColor(vibrant, 'dark')}
                      style={{ background: `rgba(${vibrant})` }}
                    ></div>
                  ) : null}
                  {muted ? (
                    <div
                      onClick={() => this.chooseColor(muted, 'dark')}
                      style={{ background: `rgba(${muted})` }}
                    ></div>
                  ) : null}
                  {lightVibrant ? (
                    <div
                      onClick={() => this.chooseColor(lightVibrant, 'dark')}
                      style={{ background: `rgba(${lightVibrant})` }}
                    ></div>
                  ) : null}
                  {lightMuted ? (
                    <div
                      onClick={() => this.chooseColor(lightMuted, 'dark')}
                      style={{ background: `rgba(${lightMuted})` }}
                    ></div>
                  ) : null}
                  {darkVibrant ? (
                    <div
                      onClick={() => this.chooseColor(darkVibrant, 'light')}
                      style={{ background: `rgba(${darkVibrant})` }}
                    ></div>
                  ) : null}
                  {darkMuted ? (
                    <div
                      onClick={() => this.chooseColor(darkMuted, 'light')}
                      style={{ background: `rgba(${darkMuted})` }}
                    ></div>
                  ) : null}
                </div>
                {color ? (
                  <button
                    onClick={() => this.changeTheme(this.state.theme)}
                    className="background-button filled-button"
                    style={{ background: `rgb(${this.state.color})` }}
                  >
                    Finalize
                  </button>
                ) : (
                  <button>Select Theme Color</button>
                )}
              </div>
            ) : null
          ) : this.state.imgs ? (
            <div className="overall-wrapper" style={{ width: `100%` }}>
              <Scrollbars style={{ height: `100%`, width: `100%` }} className="thumbnail-wrapper">
                <div className="thumbnail-wrapper" style={{ width: `100%` }}>
                  {this.state.imgs.map((val, i) => {
                    return (
                      <div
                        className="map-item"
                        onClick={() => this.bigPicture(i, this.state.imgs[i].urls.raw)}
                        key={i}
                        style={{
                          background: `url(${val.urls.small}) center`,
                          backgroundSize: `cover`,
                          borderRadius: `3px`,
                        }}
                      ></div>
                    );
                  })}
                </div>
              </Scrollbars>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { user_id, image, color, theme } = state;
  return { user_id, image, color, theme };
}
export default connect(mapStateToProps, { setTheme, setColor, setBG })(Bgp);
