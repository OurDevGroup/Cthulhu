import React from 'react';
import config from '../../../config.json';
import Sections from './sections';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            message: '',
            authenticated: false
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUsernameChange(event) {
        this.setState({username: event.target.value});
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    handleSubmit(event) {
        $.ajax({
            url: "http://localhost:3030/login",
            dataType: 'json',
            type: 'POST',
            data: '{"username":"'+this.state.username+'","password":"'+this.state.password+'"}',
            success: function(data) {
                this.setState({message: data.message, authenticated: data.authenticated});
            }.bind(this)
        });
        event.preventDefault();
    }

    renderMessage() {
        if(this.state.message !== '') {
            if(this.state.authenticated)
                return (<div className="alert alert-success">{this.state.message}</div>)
            else
                return (<div className="alert alert-danger">{this.state.message}</div>)
        }
        else
            return null
    }

    renderBody() {
        if(!this.state.authenticated){
            return (
                <div>
                    <img src="images/cuthulhuLogo.jpg" className="img-fluid" />
                    <form onSubmit={this.handleSubmit}>
                        <div className="formGroup col-sm-12">
                            <label>
                                Username:
                            </label>
                            <input type="text" value={this.state.username} onChange={this.handleUsernameChange} />
                        </div>
                        <div className="formGroup col-sm-12">
                            <label>
                                Password:
                            </label>
                            <input type="password" value={this.state.password} onChange={this.handlePasswordChange} />
                        </div>
                        <input type="submit" value="Submit" className="btn btn-danger" />
                    </form>
                </div>
            )
        }
        else {
            console.log(config.repos);
            var repos = Object.keys(config.repos).map((key, index) => {
                console.log(key);
                return (
                    <Sections parentSectionName="repos" sectionName={key} />
                );
            })
            return (
                <div>
                    <img src="images/cuthulhuLogo.jpg" className="img-fluid" />
                    <Sections sectionName="repos" />
                    <Sections sectionName="connections" />
                    <Sections sectionName="defaults" />
                </div>
            )
        }
    }

    render() {
        return (
            <div className="pageContainer col-sm-12">
                <div>{this.renderMessage()}</div>
                <div className="col-sm-12">{this.renderBody()}</div>
            </div>
        );
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.message !== this.state.message) {
            return true;
        }
    }
}
export default App;