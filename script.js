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
            "Rubik": "Rubik",
          },
        },
      },
      "font-size": { 
        displayName: "Font Size",
        defaultValue: "20px", 
        type: "number",
        typeSpecificInfo: {},
      },
      "height": { 
        displayName: "Height",
        defaultValue: "50px", 
        type: "number",
        typeSpecificInfo: {},
      },
      "width": { 
        displayName: "Width",
        defaultValue: "150px", 
        type: "number",
        typeSpecificInfo: {},
      },
      "onclick": { 
        displayName: "On Click",
        defaultValue: "alert('Hello!')", 
        type: "code",
        typeSpecificInfo: {},
      },
    },
  },
  fixedhighlight: {
    html: "<div style='~css~'>Highlighted Text</div>",
    css: "background-color: yellow; font-family: Arial; font-size: 20px;",
    js: "",
    specialHandlers: {
      specialElementHandlerOn: false,
      specialElementHandlerID: "",
      specialCodeHandlerOn: false,
      specialCodeHandlerID: "",
    },
    options: {
      "background-color": { 
        displayName: "Background Color",
        defaultValue: "yellow",
        type: "color",
        typeSpecificInfo: {},
      },
      "font-family": {
        displayName: "Font",
        defaultValue: "Arial",
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
        type: "number",
        typeSpecificInfo: {},
      },
    },
  },
  colortext: {
    html: "<span style='~css~'>Colored Text</span>",
    css: "color: ~color~; font-family: Arial; font-size: 20px;",
    js: "",
    specialHandlers: {
      specialElementHandlerOn: false,
      specialElementHandlerID: "",
      specialCodeHandlerOn: false,
      specialCodeHandlerID: "",
    },
    options: {
      "color": { 
        displayName: "Text Color",
        defaultValue: "blue",
        type: "color",
        typeSpecificInfo: {},
      },
      "font-family": {
        displayName: "Font",
        defaultValue: "Arial",
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
        type: "number",
        typeSpecificInfo: {},
      },
    },
  },
};

function addElement() {
  const newElementInfo = addElementTemplates[selectedType];
  let newElementHTML = newElementInfo.html;
  let newElementCSS = newElementInfo.css;
  let newElementJS = newElementInfo.js;

  const allOptions = Object.keys(newElementInfo.options);
  allOptions.forEach((optionKey) => {
    const inputElem = document.querySelector(`[data-key="${optionKey}"]`);
    const value = inputElem.value;
    const cssToReplace = newElementInfo.options[optionKey].displayName;
    const cssPattern = new RegExp("~" + optionKey + "~", "g");
    newElementCSS = newElementCSS.replace(cssPattern, value);
  });

  newElementHTML = newElementHTML.replace("~css~", newElementCSS);
  newElementHTML = newElementHTML.replace("~onclick~", newElementInfo.options["onclick"].defaultValue);

  const advancedHTML = document.getElementById("custom-html").value;
  const advancedCSS = document.getElementById("custom-css").value;
  const advancedJS = document.getElementById("custom-js").value;

  if (advancedHTML) {
    newElementHTML = advancedHTML;
  }

  if (advancedCSS) {
    newElementCSS = advancedCSS;
  }

  if (advancedJS) {
    newElementJS = advancedJS;
  }

  newElementHTML = newElementHTML.replace("~css~", newElementCSS);
  newElementHTML = newElementHTML.replace("~onclick~", newElementInfo.options["onclick"].defaultValue);

  restoreCaretPosition();
  document.execCommand("insertHTML", false, newElementHTML);
  resetPropertiesForm();
}

function showPropertiesForm() {
  const propertiesForm = document.getElementById("properties-form");
  propertiesForm.style.display = "block";
  propertiesForm.innerHTML = "";

  const newElementInfo = addElementTemplates[selectedType];
  const allOptions = Object.keys(newElementInfo.options);

  allOptions.forEach((optionKey) => {
    const optionInfo = newElementInfo.options[optionKey];
    const optionDisplayName = optionInfo.displayName;
    const optionDefaultValue = optionInfo.defaultValue;
    const optionType = optionInfo.type;

    let inputElem;
    if (optionType === "text") {
      inputElem = document.createElement("input");
      inputElem.type = "text";
      inputElem.value = optionDefaultValue;
    } else if (optionType === "number") {
      inputElem = document.createElement("input");
      inputElem.type = "number";
      inputElem.value = optionDefaultValue.replace(/[^0-9.]/g, "");
    } else if (optionType === "color") {
      inputElem = document.createElement("input");
      inputElem.type = "color";
      inputElem.value = optionDefaultValue;
    } else if (optionType === "dropdown") {
      inputElem = document.createElement("select");
      const dropdownOptions = optionInfo.typeSpecificInfo.dropdownOptions;
      Object.keys(dropdownOptions).forEach((dropdownOptionKey) => {
        const optionElem = document.createElement("option");
        optionElem.value = dropdownOptionKey;
        optionElem.textContent = dropdownOptions[dropdownOptionKey];
        if (dropdownOptionKey === optionDefaultValue) {
          optionElem.selected = true;
        }
        inputElem.appendChild(optionElem);
      });
    } else if (optionType === "code") {
      inputElem = document.createElement("textarea");
      inputElem.value = optionDefaultValue;
    }

    inputElem.setAttribute("data-key", optionKey);
    const label = document.createElement("label");
    label.textContent = optionDisplayName;

    const container = document.createElement("div");
    container.appendChild(label);
    container.appendChild(inputElem);

    propertiesForm.appendChild(container);
  });

  const addButton = document.createElement("button");
  addButton.textContent = "Add Element";
  addButton.addEventListener("click", function (event) {
    event.preventDefault();
    addElement();
  });

  propertiesForm.appendChild(addButton);
}

document.getElementById("add-element-bttn").addEventListener("click", function(event) {
  event.preventDefault();
  showPropertiesForm();
});

function saveCaretPosition() {
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0);
  }
}

function restoreCaretPosition() {
  if (savedRange) {
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }
}

document.getElementById("add-stuff-bttn").addEventListener("click", function() {
  selectedType = 'button';
  showPropertiesForm();
});

document.getElementById("add-stuff-dropdown").addEventListener("click", function(event) {
  selectedType = event.target.getAttribute("data-type");
  showPropertiesForm();
});

// Toggle the advanced properties section
document.getElementById("toggle-advanced-properties").addEventListener("click", function() {
  var advancedProperties = document.getElementById("advanced-properties");
  if (advancedProperties.style.display === "none") {
    advancedProperties.style.display = "block";
    this.textContent = "Hide Advanced Properties";
  } else {
    advancedProperties.style.display = "none";
    this.textContent = "Show Advanced Properties";
  }
});

// Handle font and font size changes
document.getElementById("font-selector").addEventListener("click", function() {
  document.execCommand("fontName", false, this.value);
  document.execCommand("fontSize", false, document.getElementById("font-size-selector").value);
});

// Dropdown toggle functionality
document.getElementById("dropdown-button").addEventListener("click", function() {
  const dropdownMenu = document.getElementById("add-stuff-dropdown");
  if (dropdownMenu.style.display === "block") {
    dropdownMenu.style.display = "none";
  } else {
    dropdownMenu.style.display = "block";
  }
});
