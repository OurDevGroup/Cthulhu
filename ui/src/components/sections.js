import React from 'react';
import config from '../../../config.json';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Sections extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sectionsObject: {},
            sectionsJSON: {},
            sectionName: "",
            sectionActive: false,
            addNew: false,
            newSetting: {
                parent: "",
                name: "",
                value: ""
            },
            config: config
        };
    }

    componentWillMount() {
        var sections = [];
        var object = config[this.props.sectionName];
        var sectionName = this.props.sectionName;

        if(Object.keys(object).length > 1) {
            Object.keys(object).map((keyName, keyIndex)=>{
                sections.push(Object.keys(object[keyName]).map((key, index)=>{
                    if(index == 0) {
                        return (
                            <div>
                            <h3>{keyName}</h3>
                            <div className="formGroup col-sm-12">
                                <label>
                                    {key}:
                                </label>
                                <input type="text" name={key} data-parent={keyName} onChange={this.handleSectionsChange.bind(this)} defaultValue={object[keyName][key]}/>
                            </div>
                            </div>
                        )
                    }
                    else if(typeof object[keyName][key] == "object") {
                        var fields = Object.keys(object[keyName][key]).map((k, i)=>{
                            return (
                                <div key={i} className="formGroup col-sm-12">
                                    <label>
                                        {k}:
                                    </label>
                                    <input type="text" name={k} data-root={keyName} data-parent={key} onChange={this.handleSectionsChange.bind(this)} defaultValue={object[keyName][key][k]}/>
                                </div>
                            );
                        });
                        return (
                            <div className="formGroup col-sm-12">
                                <label>
                                    {key}
                                </label>
                                <div>{fields}</div>
                            </div>
                        )
                    }
                    else
                        return (
                            <div className="formGroup col-sm-12">
                                <label>
                                    {key}:
                                </label>
                                <input type="text" name={key} data-parent={keyName} onChange={this.handleSectionsChange.bind(this)} defaultValue={object[keyName][key]}/>
                            </div>
                        )
                }))
            });
        }
        else {
            sections.push(Object.keys(object).map((key, index)=>{
                return(
                    <div>
                        <h3>{this.props.sectionName}</h3>
                        <div className="formGroup col-sm-12">
                            <label>
                                {key}:
                            </label>
                            <input type="text" name={key} data-parent={this.props.sectionName} onChange={this.handleSectionsChange.bind(this)} defaultValue={object[key]}/>
                        </div>
                    </div>
                )
            }));
        }

        this.setState({
            sectionsObject: sections,
            sectionsJSON: object,
            sectionName: sectionName,
        });
    }

    newSetting() {
        return (
            <div>
                <h3><input name="parent" type="text" onChange={this.handleNewSectionsChange.bind(this)}/></h3>
                <div className="formGroup col-sm-12">
                    <label>
                        <input name="name" type="text" onChange={this.handleNewSectionsChange.bind(this)}/>
                    </label>
                    <input name="value" type="text" onChange={this.handleNewSectionsChange.bind(this)}/>
                </div>
            </div>
        )
    }

    handleNewSectionsChange(event) {
        var setting = this.state.newSetting;
        setting[event.target.name] = event.target.value;
        console.log(setting); 
        this.setState({
            newSetting: setting
        })
        if(typeof this.state.newSetting.parent !== "") {
            var secJSON = this.state.sectionsJSON;
            if(!(this.state.newSetting.parent.length > 1)){
                var secJSONStr = JSON.stringify(secJSON);
                secJSONStr = secJSONStr.slice(0, -1);
                secJSONStr += ',"' + this.state.newSetting.parent + '": ""}'
                secJSON = JSON.parse(secJSONStr);
                this.setState({
                    sectionsJSON: secJSON
                })
            } else if(typeof secJSON[this.state.newSetting.parent] == "undefined") {
                var oldName = this.state.newSetting.parent.slice(0, -1);
                var newName = this.state.newSetting.parent;
                if(secJSON.hasOwnProperty(this.state.newSetting.parent.slice(0, -1))) {
                    if (secJSON.hasOwnProperty(oldName)) {
                        secJSON[newName] = secJSON[oldName];
                        delete secJSON[oldName];
                    }
                }
            } else if(typeof this.state.newSetting.name !== "" && typeof this.state.newSetting.value !== "") {
                var jsonString = '{"' + this.state.newSetting.name + '": "' + this.state.newSetting.value + '"}';
                secJSON[this.state.newSetting.parent] = JSON.parse(jsonString);
            }
        }
    }


    handleSectionsChange(event) {
        var secJSON = this.state.sectionsJSON;
        if(typeof event.target.dataset.root == "undefined")
            secJSON[event.target.dataset.parent][event.target.name] = event.target.value;
        else
            secJSON[event.target.dataset.root][event.target.dataset.parent][event.target.name] = event.target.value;
        this.setState({
            sectionsJSON: secJSON
        })
        console.log(this.state.sectionsJSON)
    }

    handleSectionsAdd(event) {
        this.setState({
            addNew: true
        })
    }

    handleSectionsClick(event) {
        this.setState({
            sectionActive: !this.state.sectionActive
        })
    }

    handleSectionsSave(event) {
        $.ajax({
            url: "http://localhost:3030/changeSetting?settingName="+this.state.sectionName,
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(this.state.sectionsJSON),
            success: function(data) {
                this.setState({message: data.message, updated: data.updated});
            }.bind(this)
        });
    }

    SlideBox() {
        return (
            <div style={{overflow: "hidden"}}>{this.state.sectionsObject}</div>
        )
    }

    SlideButton() {
        return (
            <div>
                <button onClick={this.handleSectionsSave.bind(this)} className="btn btn-default">Save</button>
                <button onClick={this.handleSectionsAdd.bind(this)} className="btn btn-default">Add</button>
            </div>
        )
    }

    render() {
        let component = this.state.sectionActive ? this.SlideBox() : '';
        let button = this.state.sectionActive ? this.SlideButton() : '';
        let newSetting = this.state.addNew && this.state.sectionActive ? this.newSetting() : '';
        return (
            <div className="section">
                <h2 onClick={this.handleSectionsClick.bind(this)}>{this.state.sectionName}</h2>
                <ReactCSSTransitionGroup 
                    transitionName="slide"
                    transitionEnterTimeout = {1000}
                    transitionLeaveTimeout = {1000}
                >
                    {component}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup 
                    transitionName="slide"
                    transitionEnterTimeout = {500}
                    transitionLeaveTimeout = {500}
                >
                    {newSetting}
                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup 
                    transitionName="fadeDiv"
                    transitionEnterTimeout = {500}
                    transitionLeaveTimeout = {500}
                >
                    {button}
                </ReactCSSTransitionGroup>
            </div>
        );
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.updated) {
            window.location.replace();
            return true;
        }
        else{
            console.log("test2")
            return false;
        }
    }
}

export default Sections;