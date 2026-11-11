import React from "react";
import OptionContainer from "./OptionContainer";
import "../styles/CategoryContainer.scss";
import { getLocaleMessage } from "../../common/i18n";

/**
 * 
 * @description Component to display a category of options in the settings page, with a title and a list of option containers for each setting element.
 * @param {{category: string, elements: Array, currentValue: Object}} props 
 * @returns {JSX.Element} Component to display a category of options in the settings page, with a title and a list of option containers for each setting element
 */
export default function CategoryContainer(props) {
  const { category, elements, currentValues = {}, highlightedOption } = props;
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
                highlighted={option.id === highlightedOption}
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
