import React, { Component } from "react";
import axios from "axios";
import "./Note.css";
import {
  noteCheck1,
  noteCheck2,
  noteCheck3,
  noteCheck4,
  noteCheck5,
} from "../../../logic/logic";

class Note extends Component {
  constructor(props) {
    const { o1, o2, o3 } = props.o;
    super(props);
    this.state = {
      selectedFont: o1 ? o1 : "",
      selectedFontColor: o2 ? o2 : "rgb(255,255,255)",
      input: o3 ? o3 : "",
      miniSettings: false,
    };
  }

  updateFont(val) {
    this.setState({ selectedFont: val });
  }
  updateFontColor(val) {
    this.setState({ selectedFontColor: val });
  }
  handleInput(val) {
    this.setState({ input: val });
  }

  toggleSettings() {
    this.setState({ miniSettings: !this.state.miniSettings });
    this.saveData();
  }

  saveData() {
    const { selectedFontColor, selectedFont, input } = this.state;
    axios
      .put(`/widget/settings/${this.props.o.master_id}`, {
        o1: selectedFont,
        o2: selectedFontColor,
        o3: input,
      })
      .then(this.props.updateWidgets());
  }

  render() {
    const { miniSettings } = this.state;
    return (
      <div
        className="note standard-widget"
        style={{ height: "100%", width: "100%" }}
      >
        {noteCheck1(this.props.x)}
        {noteCheck2(this.props.y)}
        {noteCheck3(this.props.w)}
        {noteCheck4(this.props.h)}
        {noteCheck5(this.props.master_id)}
        <button
          className="widget-settings-button"
          onClick={() => this.toggleSettings()}
        >
          •••
        </button>

        <div>
          {miniSettings ? (
            <div
              className="widget-settings"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="widget-settings-item">
                <h3>Font: </h3>
                <select onChange={(e) => this.updateFont(e.target.value)}>
                  <option value="Noto Sans">Default</option>
                  <option value="impact">Impact</option>
                  <option value="times new roman">Times New Roman</option>
                  <option value="courier new">Courier New</option>
                  <option value="verdana">Verdana</option>
                </select>
              </div>
              <div className="widget-settings-item">
                <h3>Font Color: </h3>
                <select
                  onChange={(e) => this.updateFontColor(e.target.value)}
                  selected={this.state.selectedFontColor}
                >
                  <option value="white">Default</option>
                  <option value="green">Green</option>
                  <option value="white">White</option>
                  <option value="grey">Grey</option>
                </select>
              </div>
            </div>
          ) : null}

          <div>
            <textarea
              className="note-area"
              onBlur={() => this.saveData()}
              onChange={(e) => this.handleInput(e.target.value)}
              value={this.state.input}
              style={{
                color: this.state.selectedFontColor,
                fontFamily: this.state.selectedFont,
                fontWeight: this.state.selectedWeight,
              }}
            />
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

export default Note;
