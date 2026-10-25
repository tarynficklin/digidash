import React, { Component } from 'react'
import axios from 'axios'
import './Dictionary.css'

export default class Dictionary extends Component {
	constructor(props){
		const {o1} = props.o
		super(props)
		this.state={
			input: '',
			returnedData: o1 ? JSON.parse(o1) : ''
		}
	}

	changeHandler(val){
		this.setState({input:val})
	}

	keyPress(e) { if (e.keyCode === 13) { document.getElementById('goButton').click() } }

	getDefinition(){
		axios.post(`/api/dictionary`,{query:this.state.input})
		.then((res)=>{
			this.setState({returnedData:res.data});
			axios.put(`/widget/settings/${this.props.o.master_id}`, {
				o1: JSON.stringify(res.data)
			}).then(this.props.updateWidgets())
		})
	}

	render() {
		return (
			<div className="dictionary standard-widget">
				<div className="dictionary-head">
					<input onChange={(e)=>{this.changeHandler(e.target.value)}} onKeyDown={this.keyPress} className="theme-input"/>
					<button onClick={()=>{this.getDefinition()}} id="goButton">Define</button>
				</div>
				<div className="dictionary-body">
					{ !this.state.returnedData ?
						<div className="dictionary-empty"><p>Oxford Dictionary</p></div>
						:
						<p>{this.state.returnedData ? this.state.returnedData.results[0].lexicalEntries.map((val,i) => <div key={i} className="dictionary-result">{i+1}. {val.entries[0].senses[0].definitions}</div>) : "" }</p>
					}
				</div>
				<div className="theme-glow"></div>
				<div className="theme-accent"><i className="fas fa-arrows-alt"></i></div>
			</div>
		)
	}
}