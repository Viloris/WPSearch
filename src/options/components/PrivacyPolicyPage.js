import React from "react";
import browser from "webextension-polyfill";

const privacyPolicy = (
    <div>
        <p>
            <strong>Privacy Policy of Wikipedia Preview</strong>
        </p>
        <p>
            <strong>Effective Date: Aug 24, 2024</strong>
        </p>
        <h2>1. Introduction</h2>
        <p>
            This page describes the Privacy Policy that applies to all
            information collected or submitted when you install or use Wikipedia
            Preview.
        </p>
        <p>
            Wikipedia Preview is owned and operated by{" "}
            <a href="https://github.com/Viloris">Viloris</a> - a developer from
            Hungary (referred to herein as "we", "us", or "our"). We take the
            protection of your personal data very seriously and will always
            offer you the Wikipedia Preview and its functionality with your
            privacy in mind.
        </p>
        <h2>2. Handling user data with Wikipedia Preview</h2>
        <p>
            To provide search functionality, Wikipedia Preview retrieves the
            input/selected text and sends the request to Wikipedia's API.
        </p>
        <p>
            <strong>We do not access/collect any of these data.</strong>
        </p>
        <p>
            Please refer to the following link:{" "}
            <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy">
                Wikipedia Privacy Policy
            </a>
        </p>
        <h2>3. External service</h2>
        <p>Wikipedia Preview uses external services in following cases:</p>
        <h4>Accessing external sites</h4>
        <p>
            Wikipedia Preview includes links to external sites. When accessing
            external sites, the privacy policy of each site is applied.
        </p>
        <h4>Installing and using in the browser</h4>
        <p>
            Wikipedia Preview is hosted on each browser's platform. Please refer
            to the following links for information on how to handle data when
            installing and using the extension.
        </p>
        <p>
            <a href="https://www.mozilla.org/en-US/privacy/firefox/">
                Firefox Privacy Policy
            </a>
            {" - "}
            <a href="https://policies.google.com/privacy">
                Google Privacy Policy
            </a>
            {" - "}
            <a href="https://privacy.microsoft.com/">
                Microsoft Privacy Policy
            </a>
        </p>
        <h2>4. Contact us</h2>
        <p>
            If you have questions about this Privacy Policy, please contact us
            at the address below:
        </p>
        <p>Email: viloris&#46;developer&#64;gmail&#46;com</p>
        <h2>5. Changes to Privacy Policy</h2> We may update this Privacy Policy
        and when we do, we will also revise the "Effective Date" at the top of
        the Privacy Policy.
    </div>
);
export default (props) => {
    return (
        <div>
            <p className="contentTitle">
                {browser.i18n.getMessage("privacyPolicyLabel")}
            </p>
            <hr />
            {privacyPolicy}
        </div>
    );
};
