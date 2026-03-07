import React from "react";
import OptionContainer from "./OptionContainer";
import "../styles/CategoryContainer.scss";
import { getLocaleMessage } from "../../common/utils";

export default function CategoryContainer(props) {
  const { category, elements, currentValues = {} } = props;
  return (
    <li className="categoryContainer">
      <fieldset>
        <legend>
          <p className="categoryTitle">
            {category !== "" ? getLocaleMessage(category) : ""}
          </p>
        </legend>
        <ul className="categoryElements">
          {elements.map((option, index) => (
            <div key={index}>
              <OptionContainer
                {...option}
                currentValue={currentValues[option.id]}
              >
                {option?.childElements && (
                  <ul className="childElements">
                    {option.childElements.map((option, index) => (
                      <OptionContainer
                        {...option}
                        currentValue={currentValues[option.id]}
                        key={index}
                      />
                    ))}
                  </ul>
                )}
              </OptionContainer>
              <hr />
            </div>
          ))}
        </ul>
      </fieldset>
    </li>
  );
}
