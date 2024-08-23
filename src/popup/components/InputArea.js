import React, { Component } from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import "../styles/InputArea.scss";

export default class InputArea extends Component {
    resizeTextArea = () => {
        const textarea = ReactDOM.findDOMNode(this.refs.textarea);
        textarea.style.height = "1px";
        textarea.style.height = `${textarea.scrollHeight + 2}px`;
    };

    handleInputText = (e) => {
        const inputText = e.target.value;
        this.props.handleInputText(inputText);
    };

    shouldComponentUpdate(nextProps) {
        const shouldUpdate =
            this.props.inputText !== nextProps.inputText ||
            this.props.sourceLang !== nextProps.sourceLang;
        return shouldUpdate;
    }

    componentDidUpdate = () => {
        this.resizeTextArea();
    };

    getPlaceholder() {
        return browser.i18n.getMessage("initialTextArea");
    }

    render() {
        const { inputText } = this.props;
        return (
            <div id="inputArea">
                <textarea
                    value={inputText}
                    ref="textarea"
                    placeholder={this.getPlaceholder()}
                    onChange={this.handleInputText}
                    autoFocus
                    spellCheck={false}
                    dir="auto"
                />
            </div>
        );
    }
}
