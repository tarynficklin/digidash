import React, { Component } from 'react'
import axios from 'axios'
import './Favorites.css'
import {favoritesCheck1,favoritesCheck2,favoritesCheck3,favoritesCheck4,favoritesCheck5} from '../../../logic/logic'

export default class Favorites extends Component {
	constructor(props){
		const {o1,o2,o3,o4,o5,o6} = props.o
		super(props)
		this.state={
			showSettings:false,
			url1:o1?o1:"https://www.facebook.com/",
			url2:o2?o2:"https://www.instagram.com",
			url3:o3?o3:"https://www.snapchat.com",
			url4:o4?o4:"https://news.google.com/?hl=en-US&gl=US&ceid=US:en",
			url5:o5?o5:"https://youtube.com",
			url6:o6?o6:"https://devmountain.com",
		}
	}

	toggleSettings(){
		this.setState({showSettings:!this.state.showSettings});
		this.saveInputs()
	}

	updateUrl1(val){
		this.setState({url1:val})
	}
	updateUrl2(val){
		this.setState({url2:val})
	}
	updateUrl3(val){
		this.setState({url3:val})
	}
	updateUrl4(val){
		this.setState({url4:val})
	}
	updateUrl5(val){
		this.setState({url5:val})
	}
	updateUrl6(val){
		this.setState({url6:val})
	}

	extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

// To address those who want the "root domain," use this function:
extractRootDomain(url,num) {
    var domain = this.extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length === 2 && splitArr[arrLen - 1].length === 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
		let firstLetter = domain.split('')[0];
		return firstLetter
	}

	saveInputs(){
		console.log(this.props.o.master_id)
		axios.put(`/widget/settings/${this.props.o.master_id}`,{
			o1:this.state.url1,
			o2:this.state.url2,
			o3:this.state.url3,
			o4:this.state.url4,
			o5:this.state.url5,
			o6:this.state.url6
		})
	}

	render() {
		const {url1,url2,url3,url4,url5,url6} = this.state
		return (
			<div className="favorites standard-widget">
			{favoritesCheck1(this.props.x)}
			{favoritesCheck2(this.props.y)}
			{favoritesCheck3(this.props.w)}
			{favoritesCheck4(this.props.h)}
			{favoritesCheck5(this.props.master_id)}
				<div className="favorites-insert">
					<h1 className="widget-settings-button" onClick={()=>this.toggleSettings()}>...</h1>
				{this.state.showSettings?
					<div className="widget-settings">
						<div className="widget-settings-item">
							<input className="theme-input" onChange={(e)=>this.updateUrl1(e.target.value)} placeholder={this.state.url1}/>
						</div>
						<div className="widget-settings-item">
							<input className="theme-input" onChange={(e)=>this.updateUrl2(e.target.value)} placeholder={this.state.url2}/>
						</div>
						<div className="widget-settings-item">
							<input className="theme-input" onChange={(e)=>this.updateUrl3(e.target.value)} placeholder={this.state.url3}/>
						</div>
						<div className="widget-settings-item">
							<input className="theme-input" onChange={(e)=>this.updateUrl4(e.target.value)} placeholder={this.state.url4}/>
						</div>
						<div className="widget-settings-item">
							<input className="theme-input" onChange={(e)=>this.updateUrl5(e.target.value)} placeholder={this.state.url5}/>
						</div>
						<div className="widget-settings-item">
							<input className="theme-input" onChange={(e)=>this.updateUrl6(e.target.value)} placeholder={this.state.url6}/>
						</div>
					</div>
				:null}
				<div className="favorites-wrapper">
					
						<a href={url1} className="favorites-container" target="_blank">
								<h1>{this.extractRootDomain(this.state.url1)}</h1>
						</a>
					
						<a href={url2} className="favorites-container" target="_blank">
								<h1>{this.extractRootDomain(this.state.url2)}</h1>
						</a>
					
						<a href={url3} className="favorites-container" target="_blank">
								<h1>{this.extractRootDomain(this.state.url3)}</h1>
						</a>
					
						<a href={url4} className="favorites-container" target="_blank">
								<h1>{this.extractRootDomain(this.state.url4)}</h1>
						</a>
					
						<a href={url5} className="favorites-container" target="_blank">
								<h1>{this.extractRootDomain(this.state.url5)}</h1>
						</a>
					
						<a href={url6} className="favorites-container" target="_blank">
								<h1>{this.extractRootDomain(this.state.url6)}</h1>
						</a>
					</div>
				</div>
				<div className="theme-glow"></div>
				<div className="theme-accent"><i className="fas fa-arrows-alt"></i></div>
			</div>
		)
	}
}
