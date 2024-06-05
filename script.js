var editor = document.getElementById("editor");
var selectedType = 'button'; // Default type
var savedRange;

// Save caret position when the editor is clicked or keyup event occurs
editor.addEventListener("click", saveCaretPosition);
editor.addEventListener("keyup", saveCaretPosition);

const addElementTemplates = {
  button: {
    html: "<button style='~css~' onclick='~onclick~'>Button</button>",
    css: "border: ~border~; border-radius: ~border-radius~; background-color: ~background-color~; font-family: ~font-family~; font-size: ~font-size~; height: ~height~; width: ~width~;",
    js: "",
    specialHandlers: {
      specialElementHandlerOn: false,
      specialElementHandlerID: "",
      specialCodeHandlerOn: false,
      specialCodeHandlerID: "",
    },
    options: {
      "border-radius": { 
        displayName: "Border Radius",
        defaultValue: "5px", 
        type: "number",
        typeSpecificInfo: {},
      },
      "border": { 
        displayName: "Border Properties",
        defaultValue: "none",
        type: "text",
        typeSpecificInfo: {},
      },
      "background-color": {
        displayName: "Background Color",
        defaultValue: "rgb(225, 225, 225)",
        type: "color",
        typeSpecificInfo: {},
      },
      "font-family": {
        displayName: "Font",
        defaultValue: "Roboto",
        type: "dropdown",
        typeSpecificInfo: {
          dropdownOptions: {
            "Roboto": "Roboto",
            "Arial": "Arial",
            "Helvetica": "Helvetica",
            "sans-serif": "Sans Serif",
            "Times New Roman": "Times New Roman",
          },
        },
      },
      "font-size": { 
        displayName: "Font Size",
        defaultValue: "20px",
        type: "text",
        typeSpecificInfo: {},
      },
      "height": { 
        displayName: "Height",
        defaultValue: "35px",
        type: "text",
        typeSpecificInfo: {},
      },
      "width": { 
        displayName: "Width",
        defaultValue: "100%",
        type: "text",
        typeSpecificInfo: {},
      },
      "onclick": { 
        displayName: "On Click",
        defaultValue: "alert('Button Clicked')",
        type: "text",
        typeSpecificInfo: {},
      },
    },
  },
  fixedhighlight: {
    html: "<span style='~css~'>Highlight</span>",
    css: "background-color: ~highlight-color~;",
    js: "",
    specialHandlers: {
      specialElementHandlerOn: false,
      specialElementHandlerID: "",
      specialCodeHandlerOn: false,
      specialCodeHandlerID: "",
    },
    options: {
      "highlight-color": {
        displayName: "Color",
        defaultValue: "rgb(225, 225, 225)",
        type: "color",
        typeSpecificInfo: {},
      },
    },
  },
  colortext: {
    html: "<span style='~css~'></span>",
    css: "color: ~color~;",
    js: "",
    specialHandlers: {
      specialElementHandlerOn: false,
      specialElementHandlerID: "",
      specialCodeHandlerOn: false,
      specialCodeHandlerID: "",
    },
    options: {
      "color": {
        displayName: "Color",
        defaultValue: "black",
        type: "color",
        typeSpecificInfo: {},
      },
      "default-text":{
        displayName: "Default Text",
        defaultValue: "Text",
        type: "text",
        typeSpecificInfo: {},
      }
    },
  },

};

// Function to save the current caret position
function saveCaretPosition() {
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0).cloneRange();
  }
}

// Function to restore the saved caret position
function restoreCaretPosition() {
  var selection = window.getSelection();
  if (savedRange) {
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
}

// Function to generate HTML with the CSS replaced by template values
function generateElementHTML(template, values) {
  let html = template.html;
  let css = template.css;
  let js = template.js;

  // Replace placeholders in HTML, CSS, and JS
  for (let option in values) {
    const regex = new RegExp(`~${option}~`, 'g');
    html = html.replace(regex, values[option]);
    css = css.replace(regex, values[option]);
    js = js.replace(regex, values[option]);
  }

  return { html: html.replace('~css~', css), css: css, js: js };
}

// Add event listeners to input fields to update advanced properties fields
function addInputEventListeners() {
  document.querySelectorAll('#element-properties input[type="text"], #element-properties input[type="color"], #element-properties select').forEach(input => {
    input.addEventListener('input', updateAdvancedProperties);
  });
}

// Function to update advanced properties fields
function updateAdvancedProperties() {
  const htmlField = document.getElementById("custom-html");
  const cssField = document.getElementById("custom-css");
  const jsField = document.getElementById("custom-js");

  const values = {};
  document.querySelectorAll('#element-properties input[type="text"], #element-properties input[type="color"], #element-properties select').forEach(input => {
    values[input.name] = input.value;
  });

  const template = addElementTemplates[selectedType];
  const updatedElements = generateElementHTML(template, values);

  htmlField.value = updatedElements.html;
  cssField.value = updatedElements.css;
  jsField.value = updatedElements.js;
}

// Function to show the properties form
function showPropertiesForm(type) {
  const template = addElementTemplates[type];
  const form = document.getElementById("element-properties");
  form.innerHTML = ""; // Clear previous form inputs

  for (let option in template.options) {
    const optionData = template.options[option];
    const label = document.createElement("label");
    label.textContent = optionData.displayName;
    form.appendChild(label);

    let input;
    switch (optionData.type) {
      case "text":
      case "number":
        input = document.createElement("input");
        input.type = optionData.type;
        input.name = option;
        input.value = optionData.defaultValue;
        break;
      case "color":
        input = document.createElement("input");
        input.type = "color";
        input.name = option;
        input.value = optionData.defaultValue;
        break;
      case "dropdown":
        input = document.createElement("select");
        input.name = option;
        for (let key in optionData.typeSpecificInfo.dropdownOptions) {
          const optionElement = document.createElement("option");
          optionElement.value = key;
          optionElement.textContent = optionData.typeSpecificInfo.dropdownOptions[key];
          input.appendChild(optionElement);
        }
        input.value = optionData.defaultValue;
        break;
      default:
        continue; // Skip if type is not handled
    }

    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  }

  // Handle special element handlers
  if (template.specialHandlers.specialElementHandlerOn) {
    handleSpecialElementHandler(template.specialHandlers.specialElementHandlerID);
  }

  // Set advanced properties to default values
  document.getElementById("custom-html").value = template.html;
  document.getElementById("custom-css").value = template.css;
  document.getElementById("custom-js").value = template.js;

  addInputEventListeners();
  document.getElementById("properties-form").style.display = "block";
}

// Handle special element handlers
function handleSpecialElementHandler(handlerID) {
  switch (handlerID) {
    case "font-size-handler":
      showFontSizeHandler();
      break;
    // Add more cases as needed for different handlers
  }
}

// Example special element handler function
function showFontSizeHandler() {
  const fontSizeInput = document.createElement("input");
  fontSizeInput.type = "range";
  fontSizeInput.min = "8";
  fontSizeInput.max = "72";
  fontSizeInput.value = "20"; // Default value
  fontSizeInput.addEventListener("input", (event) => {
    document.querySelector('input[name="font-size"]').value = event.target.value + "px";
    updateAdvancedProperties();
  });
  document.getElementById("element-properties").prepend(fontSizeInput);
}

// Handle special code handlers
function handleSpecialCodeHandler(handlerID, values) {
  switch (handlerID) {
    case "example-code-handler":
      return exampleCodeHandler(values);
    // Add more cases as needed for different handlers
  }
}

// Example special code handler function
function exampleCodeHandler(values) {
  // Modify values as needed based on special logic
  values["border"] = "2px solid red";
  return values;
}

// Toggle dropdown menu visibility
document.getElementById("dropdown-button").addEventListener("click", () => {
  var dropdownMenu = document.getElementById("add-stuff-dropdown");
  dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Handle dropdown item selection
document.querySelectorAll('.dropdown-menu li').forEach(item => {
  item.addEventListener('click', (event) => {
    selectedType = event.target.getAttribute('data-type');
    showPropertiesForm(selectedType);

    // Change the main button text
    var button = document.getElementById("add-stuff-bttn");
    button.innerHTML = `Add ${event.target.innerText}`;
    updateAdvancedProperties();
    // Hide the dropdown menu
    document.getElementById("add-stuff-dropdown").style.display = 'none';
  });
});

// Add element on main button click
document.getElementById("add-element-bttn").addEventListener("click", () => {
  const form = document.getElementById("element-properties");
  const values = {};
  for (let element of form.elements) {
    values[element.name] = element.value;
  }

  // Handle special code handlers
  if (addElementTemplates[selectedType].specialHandlers.specialCodeHandlerOn) {
    values = handleSpecialCodeHandler(addElementTemplates[selectedType].specialHandlers.specialCodeHandlerID, values);
  }

  // Use custom values if advanced properties are shown
  const useCustomHTML = document.getElementById("custom-html").value;
  const useCustomCSS = document.getElementById("custom-css").value;
  const useCustomJS = document.getElementById("custom-js").value;

  const template = addElementTemplates[selectedType];
  let elementHTML;
  if (useCustomHTML && useCustomCSS) {
    elementHTML = useCustomHTML.replace('~css~', useCustomCSS);
  } else {
    const generatedElement = generateElementHTML(template, values);
    elementHTML = generatedElement.html;
  }

  // Restore caret position and insert the element
  restoreCaretPosition();

  // Insert the HTML using range.insertNode instead of execCommand
  let tempDiv = document.createElement('div');
  tempDiv.innerHTML = elementHTML;
  let node = tempDiv.firstChild;
  savedRange.insertNode(node);
  savedRange.setStartAfter(node);
  savedRange.setEndAfter(node);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(savedRange);

  if (useCustomJS) {
    const script = document.createElement('script');
    script.innerHTML = useCustomJS;
    document.body.appendChild(script);
  }

  document.getElementById("properties-form").style.display = "none"; // Hide properties form
});

// Toggle advanced properties visibility
document.getElementById("toggle-advanced-properties").addEventListener("click", () => {
  const advancedProperties = document.getElementById("advanced-properties");
  advancedProperties.style.display = advancedProperties.style.display === 'block' ? 'none' : 'block';
  const toggleButton = document.getElementById("toggle-advanced-properties");
  toggleButton.innerHTML = advancedProperties.style.display === 'block' ? 'Hide Advanced Properties' : 'Show Advanced Properties';
});

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropdown-button') && !event.target.closest('.dropdown-button')) {
    var dropdowns = document.getElementsByClassName("dropdown-menu");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.style.display === 'block') {
        openDropdown.style.display = 'none';
      }
    }
  }
};
