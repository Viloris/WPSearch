import React, { Component } from "react";
import ReactDOM from "react-dom";
import { getSettings } from "src/settings/settings";
import "../styles/ResultPanel.scss";
import { getBackgroundColor } from "../../settings/defaultColors";
import ResultSection from "./ResultSection";
import {
    getMainLangText,
    getSecondLangText,
    getSecondTargetLang,
    getTargetLang
} from "../../common/utils";
import { setSettings } from "../../settings/settings";
import InfoBar from "../../common/infoBar";
import browser from "webextension-polyfill";

export default class ResultPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            panelPosition: { x: 0, y: 0 },
            panelWidth: 0,
            panelHeight: 0,
            shouldResize: true,
            isOverflow: false,
            hideInformationLabel: getSettings("hideInformationLabel")
        };
        this.dragOffsets = { x: 0, y: 0 };
        this.isDragging = false;
    }

    componentDidMount = () => {
        document.addEventListener("dragstart", this.handleDragStart);
        document.addEventListener("dragover", this.handleDragOver);
        document.addEventListener("drop", this.handleDrop);
    };

    componentWillUnmount = () => {
        document.removeEventListener("dragstart", this.handleDragStart);
        document.removeEventListener("dragover", this.handleDragOver);
        document.removeEventListener("drop", this.handleDrop);
    };

    handleDragStart = (e) => {
        if (e.target.className !== "simple-wikipedia-search-move") return;
        this.isDragging = true;

        const rect = document
            .querySelector(".simple-wikipedia-search-panel")
            .getBoundingClientRect();
        this.dragOffsets = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        e.dataTransfer.setData("text/plain", "");
    };

    handleDragOver = (e) => {
        if (!this.isDragging) return;
        e.preventDefault();
        const panel = document.querySelector(".simple-wikipedia-search-panel");
        panel.style.top = `${e.clientY - this.dragOffsets.y}px`;
        panel.style.left = `${e.clientX - this.dragOffsets.x}px`;
    };

    handleDrop = (e) => {
        if (!this.isDragging) return;
        e.preventDefault();
        this.isDragging = false;

        const panel = document.querySelector(".simple-wikipedia-search-panel");
        panel.style.top = `${e.clientY - this.dragOffsets.y}px`;
        panel.style.left = `${e.clientX - this.dragOffsets.x}px`;
    };

    calcPosition = () => {
        const maxWidth = parseInt(getSettings("width"));
        const maxHeight = parseInt(getSettings("height"));
        const wrapper = ReactDOM.findDOMNode(this.refs.wrapper);
        const panelWidth = Math.min(wrapper.clientWidth, maxWidth);
        const panelHeight = Math.min(wrapper.clientHeight, maxHeight);
        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;
        const referencePosition = this.props.position;
        const offset = parseInt(getSettings("panelOffset"));
        const halfPanelWidth = panelWidth / 2;
        const halfPanelHeight = panelHeight / 2;

        let position = { x: 0, y: 0 };
        const panelDirection = getSettings("panelDirection");
        switch (panelDirection) {
            case "top":
                position.x = referencePosition.x - halfPanelWidth;
                position.y = referencePosition.y - panelHeight - offset;
                break;
            case "bottom":
                position.x = referencePosition.x - halfPanelWidth;
                position.y = referencePosition.y + offset;
                break;
            case "right":
                position.x = referencePosition.x + offset;
                position.y = referencePosition.y - halfPanelHeight;
                break;
            case "left":
                position.x = referencePosition.x - panelWidth - offset;
                position.y = referencePosition.y - halfPanelHeight;
                break;
            case "topRight":
                position.x = referencePosition.x + offset;
                position.y = referencePosition.y - panelHeight - offset;
                break;
            case "topLeft":
                position.x = referencePosition.x - panelWidth - offset;
                position.y = referencePosition.y - panelHeight - offset;
                break;
            case "bottomRight":
                position.x = referencePosition.x + offset;
                position.y = referencePosition.y + offset;
                break;
            case "bottomLeft":
                position.x = referencePosition.x - panelWidth - offset;
                position.y = referencePosition.y + offset;
                break;
        }

        if (position.x + panelWidth > windowWidth - offset) {
            position.x = windowWidth - panelWidth - offset;
        }
        if (position.y + panelHeight > windowHeight - offset) {
            position.y = windowHeight - panelHeight - offset;
        }
        if (position.x < 0 + offset) {
            position.x = offset;
        }
        if (position.y < 0 + offset) {
            position.y = offset;
        }
        return position;
    };

    calcSize = () => {
        const maxWidth = parseInt(getSettings("width"));
        const wrapper = ReactDOM.findDOMNode(this.refs.wrapper);
        const wrapperWidth =
            wrapper.clientWidth < maxWidth ? wrapper.clientWidth + 1 : maxWidth;
        const wrapperHeight = wrapper.clientHeight;
        return { panelWidth: wrapperWidth, panelHeight: wrapperHeight };
    };

    componentWillReceiveProps = (nextProps) => {
        const isChangedContents =
            this.props.resultText !== nextProps.resultText ||
            this.props.candidateText !== nextProps.candidateText ||
            this.props.position !== nextProps.position;

        if (isChangedContents && nextProps.shouldShow)
            this.setState({ shouldResize: true });
    };

    componentDidUpdate = () => {
        if (!this.state.shouldResize || !this.props.shouldShow) return;
        const panelPosition = this.calcPosition();
        const { panelWidth, panelHeight } = this.calcSize();
        const isOverflow = panelHeight == parseInt(getSettings("height"));

        this.setState({
            shouldResize: false,
            panelPosition: panelPosition,
            panelWidth: panelWidth,
            panelHeight: panelHeight,
            isOverflow: isOverflow
        });
    };

    dismissHint = () => {
        setSettings("hideInformationLabel", true);
        this.setState({
            hideInformationLabel: true,
            hidePanel: true
        });
    };

    render = () => {
        const {
            shouldShow,
            resultMain,
            resultSecond,
            isErrorMain,
            isErrorSecond,
            errorMessageMain,
            errorMessageSecond,
            selectedText
        } = this.props;
        const { width, height } = this.state.shouldResize
            ? {
                  width: parseInt(getSettings("width")),
                  height: parseInt(getSettings("height"))
              }
            : { width: this.state.panelWidth, height: this.state.panelHeight };

        const panelStyles = {
            width: width,
            height: height,
            top: this.state.panelPosition.y,
            left: this.state.panelPosition.x,
            fontSize: parseInt(getSettings("fontSize"))
        };

        const backgroundColor = getBackgroundColor();
        if (backgroundColor) {
            panelStyles.backgroundColor = backgroundColor.backgroundColor;
        }

        const wrapperStyles = {
            overflow: this.state.isOverflow ? "auto" : "hidden"
        };

        const targetLang = getTargetLang();
        const secondTargetLang = getSecondTargetLang();
        const mainLangText = getMainLangText();
        const secondLangText = getSecondLangText();
        const useTheSecondTargetLang = getSettings("shouldUseSecondTargetLang");
        const information = browser.i18n.getMessage("firstInformationText");
        return (
            <div
                className={`simple-wikipedia-search-panel ${
                    shouldShow ? "isShow" : ""
                }`}
                ref="panel"
                style={panelStyles}
            >
                <div
                    className="simple-wikipedia-search-result-wrapper"
                    ref="wrapper"
                    style={wrapperStyles}
                >
                    <div
                        className="simple-wikipedia-search-move"
                        draggable="true"
                        ref="move"
                    />
                    <div className="simple-wikipedia-search-result-contents">
                        <ResultSection
                            mainLangText={mainLangText}
                            result={resultMain}
                            isError={isErrorMain}
                            language={targetLang}
                            searchExpression={selectedText}
                        />

                        <ErrorSection
                            errorMessage={errorMessageMain}
                            isError={isErrorMain}
                        />
                        {!this.state.hideInformationLabel &&
                            !useTheSecondTargetLang && (
                                <InfoBar
                                    hidePanel={this.state.hidePanel}
                                    message={information}
                                    onClick={this.dismissHint}
                                />
                            )}
                        {useTheSecondTargetLang && (
                            <>
                                <br />
                                <ResultSection
                                    mainLangText={secondLangText}
                                    result={resultSecond}
                                    isError={isErrorSecond}
                                    language={secondTargetLang}
                                    searchExpression={selectedText}
                                />
                                <ErrorSection
                                    errorMessage={errorMessageSecond}
                                    isError={isErrorSecond}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };
}

/* If API error */
function ErrorSection(props) {
    const { errorMessageMain, isError } = props;
    if (isError)
        return (
            <p className="simple-wikipedia-search-error">{errorMessageMain}</p>
        );
    return null;
}
