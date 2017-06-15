import React from 'react';
import config from '../../../config.json';

class Sections extends React.Component {
    constructor(props) {
        super(props);

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

        this.state = {
            sectionsObject: sections,
            sectionsJSON: object,
            sectionName: sectionName,
            sectionActive: false
        };
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
        console.log(this.state.sectionsJSON);
    }

    handleSectionsClick(event) {
        if(this.state.sectionActive)
            this.setState({
                sectionActive: false
            })
        else
            this.setState({
                sectionActive: true
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
        event.preventDefault();
    }

    render() {
        if(this.state.sectionActive)
            return (
                <div>
                    <h2 onClick={this.handleSectionsClick.bind(this)}>{this.state.sectionName}</h2>
                    <div>{this.state.sectionsObject}</div>
                    <button onClick={this.handleSectionsSave.bind(this)}>Save</button>
                </div>
            );
        else
            return (
                <div>
                    <h2 onClick={this.handleSectionsClick.bind(this)}>{this.state.sectionName}</h2>
                </div>
            );
    }
}

export default Sections;