import React from 'react';
import config from '../../../config.json';
import Sections from './sections';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class App extends React.Component {
    constructor(props) {
        super(props);
        var oneHour = 60 * 60 * 1000;
        var currentTime = new Date();
        var loginTime = new Date(localStorage.getItem("date"));
        if(!((currentTime - loginTime) < oneHour)) {
            localStorage.setItem("authenticated", false)
        }

        this.state = {
            username: '',
            password: '',
            message: '',
            authenticated: true,//typeof localStorage.getItem("authenticated") !== "undefined" ? localStorage.getItem("authenticated") : false,
            showMessage: false
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
                this.setState({message: data.message, authenticated: data.authenticated})
                localStorage.setItem("authenticated", this.state.authenticated);
                localStorage.setItem("date", new Date());
            }.bind(this)
        });
        this.setState({showMessage: true});
        event.preventDefault();
    }

    MessageGood() {
        return (
            <div className="alert alert-success" onClick={this.handleMessageClick.bind(this)}>{this.state.message}</div>
        )
    }

    MessageBad() {
        return (
            <div className="alert alert-danger" onClick={this.handleMessageClick.bind(this)}>{this.state.message}</div>
        )
    }

    handleMessageClick(event) {
        this.setState({
            showMessage: !this.state.showMessage
        })
    }

    renderMessage() {
        if(this.state.message !== '') {
            let message = this.state.authenticated ? this.MessageGood() : this.MessageBad();
            
            return (
                <div style={{overflow: "hidden"}} onClick={this.handleMessageClick.bind(this)}>{message}</div>
            )
        }
        else
            return null
    }

    renderBody() {
        if(this.state.authenticated.toString() == "false"){
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
                        <input type="submit" value="Submit" className="btn btn-default" />
                    </form>
                </div>
            )
        }
        else {
            var configs = Object.keys(config).map((key, index) => {
                return (
                    <Sections sectionName={key} />
                );
            })
            return (
                <div>
                    <img src="images/cuthulhuLogo.jpg" className="img-fluid" />
                    {configs}
                </div>
            )
        }
    }

    render() {
        let messageShow = this.state.showMessage ? this.renderMessage() : '';
        return (
            <div className="pageContainer col-sm-12">
                <ReactCSSTransitionGroup 
                    transitionName="slide"
                    transitionEnterTimeout = {5000}
                    transitionLeaveTimeout = {5000}
                >
                    {messageShow}
                </ReactCSSTransitionGroup>
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