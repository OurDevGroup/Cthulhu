import React from 'react';

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
        if(this.state.message !== ''){
            return (<div>{this.state.message}</div>)
        }
        else
            return null
    }

    renderBody() {
        if(!this.state.authenticated){
            return (
                <form onSubmit={this.handleSubmit}>
                    <label>
                    Username:
                    <input type="text" value={this.state.username} onChange={this.handleUsernameChange} />
                    </label>
                    <label>
                    Password:
                        <input type="password" value={this.state.password} onChange={this.handlePasswordChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            )
        }
        else
            return null
    }

    render() {
        return (
            <div>
                <div>{this.renderMessage()}</div>
                <div>{this.renderBody()}</div>
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