import React, { Component } from "react";
import browser from "webextension-polyfill";
import { getSettings } from "src/settings/settings";
import SearchButton from "./SearchButton";
import ResultPanel from "./ResultPanel";
import "../styles/SearchContainer.scss";
import { getTargetLang } from "../../common/utils";

const translateText = async (expression) => {
    const result = await browser.runtime.sendMessage({
        message: "wikipediaSearch",
        expression
    });
    return result;
};

export default class SearchContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shouldShowButton: false,
            buttonPosition: { x: 0, y: 0 },
            shouldShowPanel: false,
            panelPosition: { x: 0, y: 0 },
            currentLang: getTargetLang(),
            resultText: "",
            resultTextMain: "",
            resultTextSecond: "",
            errorMessageMain: "",
            errorMessageSecond: "",
            isErrorMain: "",
            isErrorSecond: ""
        };
        this.selectedText = props.selectedText;
        this.selectedPosition = props.selectedPosition;
    }

    componentDidMount = () => {
        if (this.props.shouldTranslate) this.showPanel();
        else this.handleTextSelect(this.props.clickedPosition);
    };

    handleTextSelect = async (clickedPosition) => {
        const onSelectBehavior = getSettings("whenSelectText");
        if (onSelectBehavior === "dontShowButton")
            return this.props.removeContainer();
        if (onSelectBehavior === "showButton") this.showButton(clickedPosition);
        else if (onSelectBehavior === "showPanel")
            this.showPanel(clickedPosition);
    };

    showButton = (clickedPosition) => {
        this.setState({
            shouldShowButton: true,
            buttonPosition: clickedPosition
        });
    };

    hideButton = () => {
        this.setState({ shouldShowButton: false });
    };

    handleButtonClick = (e) => {
        const clickedPosition = { x: e.clientX, y: e.clientY };
        this.showPanel(clickedPosition);
        this.hideButton();
    };

    showPanel = async (clickedPosition = null) => {
        const panelReferencePoint = getSettings("panelReferencePoint");
        const useClickedPosition =
            panelReferencePoint === "clickedPoint" && clickedPosition !== null;
        const panelPosition = useClickedPosition
            ? clickedPosition
            : this.selectedPosition;
        const result = await translateText(this.selectedText);

        this.setState({
            shouldShowPanel: true,
            panelPosition: panelPosition,
            resultTextMain: result?.resultTextMain,
            resultTextSecond: result?.resultTextSecond,
            errorMessageMain: result?.errorMessageMain,
            errorMessageSecond: result?.errorMessageSecond,
            isErrorMain: result?.isErrorMain,
            isErrorSecond: result?.isErrorSecond,
            selectedText: this.selectedText
        });
    };

    hidePanel = () => {
        this.setState({ shouldShowPanel: false });
    };

    render = () => {
        return (
            <div>
                <SearchButton
                    shouldShow={this.state.shouldShowButton}
                    position={this.state.buttonPosition}
                    handleButtonClick={this.handleButtonClick}
                />
                <ResultPanel
                    shouldShow={this.state.shouldShowPanel}
                    position={this.state.panelPosition}
                    selectedText={this.state.selectedText}
                    currentLang={this.state.currentLang}
                    resultTextMain={this.state.resultTextMain}
                    resultTextSecond={this.state.resultTextSecond}
                    errorMessageMain={this.state.errorMessageMain}
                    errorMessageSecond={this.state.errorMessageSecond}
                    isErrorMain={this.state.isErrorMain}
                    isErrorSecond={this.state.isErrorSecond}
                    hidePanel={this.hidePanel}
                />
            </div>
        );
    };
}
