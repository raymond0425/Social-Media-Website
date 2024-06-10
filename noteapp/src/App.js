import React from 'react'
import ReactDOM from 'react-dom/client';
import $ from 'jquery'
import './App.css';
import { useState } from 'react';

class LoginButton extends React.Component{
	constructor(props){
		super(props)
	}

	render(){
		return <button onClick={()=>this.props.handleLogin()}>Sign in</button>;
	}
}

class LogoutButton extends React.Component {
	constructor(props){
		super(props)
	}

	render(){
		return <button className= "logoutButton" onClick={()=>this.props.handleLogout()}>Log out</button>;
	}

}

class NoteList extends React.Component {
	// this.props.notewritten and this.props.showingNoteID is passed when creating it
	constructor(props){
		super(props);
		this.handleNoteChange = this.handleNoteChange.bind(this)
	}

	handleNoteChange(event) {
		this.props.handleNoteChange(event.target.id);
	}

	render() {
		var rows = [];

		this.props.sortNotesWritten();

		for (let note of this.props.notewritten) {
			if (this.props.showingNoteID == note._id) {
				rows.push(<li key={note._id} id={note._id} className="active" onClick={(ev)=>this.handleNoteChange(ev)}>{note.title}</li>)
			} else {
				rows.push(<li key={note._id} id={note._id} onClick={(ev)=>this.handleNoteChange(ev)}>{note.title}</li>)
			}
		}

		return (
			<ul> {rows} </ul>
		);
	}
}

class SearchBox extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			inputText : "Search"
		}
		this.handleSearchChange = this.handleSearchChange.bind(this)
		this.handleinputsearchchange = this.handleinputsearchchange.bind(this)
	}

	handleSearchChange(e){
		if(e.key == "Enter"){
			e.preventDefault();
			this.props.handleSearchChange(this.state.inputText);
		}
	}

	handleinputsearchchange(e){
		e.preventDefault();
		this.setState ({inputText: e.target.value});
	}

	render(){
		return(
			<input 
				className = "searchBox"
				id="input_name"
				value= {this.state.inputText}
				onChange ={e => this.handleinputsearchchange(e)}
				onKeyUp={e => this.handleSearchChange(e)} />
		)
	}
}

class ButtonShown extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var element = <React.Fragment></React.Fragment>

		if (this.props.isEditingNote) { // editing note
			element = (
			<React.Fragment>
			<button className="optionButtons" onClick={ev=>this.props.handleSave(ev)}>Save</button>
			<button className="optionButtons" onClick={ev=>this.props.handleCancel(ev)}>Cancel</button>
			</React.Fragment>
			)
		}

		else { // not editing note
			element = (
				<React.Fragment>
				<button className="optionButtons" onClick={ev=>this.props.handleDelete(ev)}>Delete</button>
				</React.Fragment>
			)
		}

		return (
			<div>{element}</div>
		)
	}
}

class App extends React.Component {
  	constructor (props){
    	super(props);
    	this.state={
    		isLogin: false,
    		icon: "",
        	notewritten: "",
			inputUserName: "",
			inputUserPswd: "",
			showingNoteLastSavedTime: "",
			showingNoteTitle: "",
			showingNoteContent: "",
			showingNoteID: "",
			isEditingNote: false
 	 	};
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleLogin = this.handleLogin.bind(this)
		this.handleLogout = this.handleLogout.bind(this)
		this.handleNoteChange = this.handleNoteChange.bind(this)
		this.handleSearchChange = this.handleSearchChange.bind(this)
		this.handleCancel = this.handleCancel.bind(this)
		this.handleSave = this.handleSave.bind(this)
		this.handleDelete = this.handleDelete.bind(this)
		this.string_to_date = this.string_to_date.bind(this)
		this.sortNotesWritten = this.sortNotesWritten.bind(this)
  	}

	//sorting here
	string_to_date(str) {
		return new Date(str.split(' ').slice(1).join(' ') + ' ' + str.split(' ')[0])
	}

	sortNotesWritten() {
		const notes = this.state.notewritten
		if (notes !== null) {
			const sortedNotes = notes.sort((note1, note2) => 
				this.string_to_date(note2.lastsavedtime) - this.string_to_date(note1.lastsavedtime)
			);
			this.state.notewritten = sortedNotes; // so that the web page won't keep refreshing
			// this is because the function is called when the web page refreshes.
		}
	}

	//handlers here
  	handleInputChange(event){
		let target = event.target
		let name = target.name
		let value = target.value
    	this.setState({[name]: value})
	}

	handleLogin(){
		$.post('http://localhost:3001/signin',{name: this.state.inputUserName, password: this.state.inputUserPswd}).done(function(result){
			if (result == "Login failure"){
				alert(result)
			}
			else{
				this.setState({
					isLogin: true,
					icon: result.icon,
					notewritten: result.notewritten,
					showingNoteLastSavedTime: "",
					showingNoteTitle: "",
					showingNoteContent: "",
					showingNoteID: "",
					isEditingNote: false
				})
			}
		}.bind(this));
	}

	handleLogout(){
		if (this.state.isEditingNote) {
			if (window.confirm("Are you sure to quit editing the note and log out?")) {
				$.get('http://localhost:3001/logout',).done(function(result){
					this.setState({
						isLogin: false,
						icon: "",
						notewritten: "",
						showingNoteLastSavedTime: "",
						showingNoteTitle: "",
						showingNoteContent: "",
						showingNoteID: "",
						isEditingNote: false
					});
				}.bind(this));
			}
		}
		else {
			$.get('http://localhost:3001/logout',).done(function(result){
				this.setState({
					isLogin: false,
					icon: "",
					notewritten: "",
					showingNoteLastSavedTime: "",
					showingNoteTitle: "",
					showingNoteContent: "",
					showingNoteID: "",
					isEditingNote: false
				});
			}.bind(this));
		}
	}

	handleNoteChange(noteid) {
		$.get(`http://localhost:3001/getnote`,{noteid: noteid}).done(function(result){
			if (result == "Error in finding note in noteList."){
				alert(result)
			}
			else{
				// result keys: _id, lastsavedtime, title, content
				this.setState({showingNoteLastSavedTime: result.lastsavedtime, showingNoteTitle: result.title, showingNoteContent: result.content, showingNoteID: result._id});
			}
		}.bind(this));
		this.setState({isEditingNote: false});
	}

	handleNoteContentChange(event) {
		if (event.target.id == 'editTitle') {
			this.setState({showingNoteTitle: event.target.value})
		} else if (event.target.id == 'editContent') {
			this.setState({showingNoteContent: event.target.value})
		}
		this.setState({isEditingNote: true});
	}

	handleNewNote(event) {
		this.setState({isEditingNote: true, showingNoteTitle: "Note title", showingNoteContent: "Note content", showingNoteID: "new note"});
	}

	handleSearchChange(text){
		$.get(`http://localhost:3001/searchnotes`,{searchstr: text}).done(function(result){
			if (result == "Error"){
				alert(result)
			}
			else{
				this.setState({notewritten: result});
			}
		}.bind(this));
	}

	handleCancel(event) {
		if (window.confirm("Are you sure to quit editing the note?")) {
			if (this.state.showingNoteID=="new note") {
				this.setState({showingNoteID: ""});
			}
			else {
				$.get(`http://localhost:3001/getnote`,{noteid: this.state.showingNoteID}).done(function(result){
					if (result == "Error in finding note in noteList."){
						alert(result)
					}
					else{
						// result keys: _id, lastsavedtime, title, content
						this.setState({showingNoteLastSavedTime: result.lastsavedtime, showingNoteTitle: result.title, showingNoteContent: result.content, showingNoteID: result._id});
					}
				}.bind(this));
			}
			this.setState({isEditingNote: false});
		}
	}

	handleSave(event) {
		if (this.state.showingNoteID=="new note") { // saving a new note
			$.post(
				'http://localhost:3001/addnote',
				{title: this.state.showingNoteTitle,
				content: this.state.showingNoteContent}
			).done(function(result){
				if (result == "Error"){
					alert(result)
				}
				else{
					// result keys: _id, lastsavedtime
					this.setState({showingNoteID: result._id, showingNoteLastSavedTime: result.lastsavedtime});
				}
			}.bind(this));
		} else { // saving existing note
			$.ajax({
				type: 'PUT',
				url: 'http://localhost:3001/savenote/' + this.state.showingNoteID,
				data: {
					title: this.state.showingNoteTitle,
					content: this.state.showingNoteContent
				}        
			}).done(function(result){
				if (result == "Error"){
					alert(result)
				}
				else{
					// result keys: _id, lastsavedtime, title, content
					this.setState({showingNoteLastSavedTime: result.lastsavedtime});
				}
			}.bind(this));
		}
		this.handleSearchChange(" ");
		this.setState({isEditingNote: false});
	}

	handleDelete(event) {
		if (window.confirm("Confirm to delete this note?")) {
			$.ajax({
				type: 'DELETE',
				url: 'http://localhost:3001/deletenote/' + this.state.showingNoteID
			}).done(function(result){
				if (result != "") { // has error
					alert(result)
				}
			}.bind(this));

			this.setState({
			showingNoteLastSavedTime: "",
			showingNoteTitle: "",
			showingNoteContent: "",
			showingNoteID: "",
			isEditingNote: false});
			this.handleSearchChange(" ");
		}
	}

	render(){
		//console.log(this.state); // for debugging
	
		if (!this.state.isLogin){
			return(
				<React.Fragment>
					<header>
            		<h1>iNotes</h1>
        			</header>
				<div className="loginform">
					Username   <input
					type="text"
					name="inputUserName"
					placeholder="username"
					value={this.state.inputUserName}
					onChange={e => this.handleInputChange(e)} />
					<br/><br/>
					Password   <input
					type="password"
					name="inputUserPswd"
					placeholder="password"
					value={this.state.inputUserPswd}
					onChange={e => this.handleInputChange(e)} />
					<br/><br/>
					<LoginButton username={this.state.inputUserName}
								password={this.state.inputUserPswd}
								handleLogin={this.handleLogin}/>
				</div>
				</React.Fragment>

			)
		}
		else{ // logged in
			var renderNoteContent = <React.Fragment></React.Fragment>
			var lastsaved = <React.Fragment></React.Fragment>

			if (this.state.showingNoteID != "new note") { // if it's not a new note
				lastsaved = <React.Fragment>Last saved: {this.state.showingNoteLastSavedTime}<br/><br/></React.Fragment>
			}

			if (this.state.showingNoteID != "") { // if a note is being shown
				renderNoteContent = (
					<React.Fragment>
							<div>
								<ButtonShown
									isEditingNote={this.state.isEditingNote}
									handleCancel={ev=>this.handleCancel(ev)}
									handleSave={ev=>this.handleSave(ev)}
									handleDelete={ev=>this.handleDelete(ev)}
								/>
								<br/>
							</div>
							<div>
								{lastsaved}
								<input id='editTitle' style={{width:'900px'}} onClick={e=>this.handleNoteContentChange(e)}
										onChange={e=>this.handleNoteContentChange(e)} value={this.state.showingNoteTitle}/>
								<br/> <br/>
								<textarea id='editContent' style={{height:'500px',width:'900px'}} onClick={e=>this.handleNoteContentChange(e)} 
										  onChange={e=>this.handleNoteContentChange(e)} value={this.state.showingNoteContent}>
								</textarea>
							</div>
					</React.Fragment>
				)
			}
			return(
				<React.Fragment>
					<header>
					<h1>iNotes</h1>
					<nav>
						<span> <img src={"http://localhost:3001/"+this.state.icon} alt="logo" width="32" height="32"></img></span>
						<span className='navName' > Welcome {this.state.inputUserName}! </span>
						<LogoutButton handleLogout={this.handleLogout}/>
					</nav>
					</header>

					<div className="col-2 menu">
						<SearchBox  handleSearchChange={x=>this.handleSearchChange(x)} /> <br/><br/>
						<label> Notes ({this.state.notewritten.length}) </label>	
						<NoteList
							notewritten={this.state.notewritten}
							showingNoteID={this.state.showingNoteID}
							sortNotesWritten={this.sortNotesWritten}
							handleNoteChange={ev=>this.handleNoteChange(ev)}
						/>
					</div>

					<div className="col-10 body right">
						{renderNoteContent}
						<button className="newNote" onClick={ev=>this.handleNewNote(ev)}> New Note </button>
					</div>
				
				</React.Fragment>
			)
		}
	}

}



export default App;