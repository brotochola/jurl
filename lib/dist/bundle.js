function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const randomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

const encodeAttr = (str) => {
  return escape(JSON.stringify(str));
};
const decodeAttr = (str) => {
  let ret;
  try {
    ret = JSON.parse(unescape(str));
  } catch (e) {
    ret = null;
  }
  return ret;
};

async function getDataFromAPI(url) {
  //    https://rickandmortyapi.com/api/character
  let data = await (await fetch(url)).json();

  return data;
}

function getAttributesStartingWith(el, str) {
  return Array.from(el.attributes).filter((k) => k.name.startsWith(str));
}

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

function convertStringToComponentFriendlyName(str) {
  return (
    "app-" +
    str
      .split(/(?=[A-Z])/)
      .join("-")
      .toLowerCase()
  );
}
window.convertStringToComponentFriendlyName =
  convertStringToComponentFriendlyName;

function removeCurlyBrackets(str) {
  return str.trim().replace("{{", "").replace("}}", "");
}

function cloneAttributes(target, source) {
  [...source.attributes].forEach((attr) => {
    target.setAttribute(attr.nodeName, attr.nodeValue);
  });
}

function duplicate(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function moveAllChildrenNodes(oldParent, newParent) {
  while (oldParent.childNodes.length) {
    newParent.appendChild(oldParent.firstChild);
  }
}

function hasCurlyBrackets(val) {
  return val.trim().startsWith("{{") && val.trim().endsWith("}}") > -1;
}

// EVAL IN COMPONENT IS THE FUNCTION THAT TAKES CARE OF REACTIVITY, AKA STUFF BETWEEN {{}} IN THE HTML

function evalInComponent(value, compo, i) {
  let updatedVal;

  if (value.indexOf("[i]") > -1 && (i == undefined || i == null)) {
    return;
  }

  if (hasCurlyBrackets(value)) {
    // debugger;
    let newValWithNoCurly = removeCurlyBrackets(value);

    let stringToBeEvalled = "compo." + newValWithNoCurly;
    let evalled;

    try {
      evalled = eval(stringToBeEvalled);
    } catch (e) {}

    if (evalled instanceof Function) {
      updatedVal = evalled.bind(compo);
    } else if (evalled instanceof Object || typeof evalled == "string") {
      updatedVal = evalled;
    } else {
      //EVAL WAS UNDEFINED
      try {
        updatedVal = eval(
          "(function(){ return " + stringToBeEvalled + " })"
        ).bind(compo)();
      } catch (e) {
        try {
          const newStringToEval =
            "(function(){return " + newValWithNoCurly + ";} ) .bind(compo)";
          updatedVal = eval(newStringToEval)();
        } catch (e) {}
      }
    }
    return updatedVal;
  } else {
    //DOESN'T HAVE {{}}
    return compo.getState(value);
  }
}

function createTree$1(component, hideComponent, showState) {
  const tree = {
    id: component.uid,
    tagName: component.tagName,
    // component: component,
    children: [],
    // html: (component.shadowRoot || {}).innerHTML || "",
  };
  if (!hideComponent) {
    tree.component = component;
  }

  if (showState) tree.state = component.state;

  const childrenComponents = component.getAllChildrenComponents();

  for (const childComponent of childrenComponents) {
    const childTree = createTree$1(childComponent, hideComponent, showState);
    tree.children.push(childTree);
  }

  return tree;
}

function flattenWebComponents(component) {
  const tree = {
    children: [],
    tagName: component.tagName,
    html: removeHTMLComments((component.shadowRoot || {}).innerHTML || ""),
  };

  const childrenComponents = component.getAllChildrenComponents();

  for (const childComponent of childrenComponents) {
    const childTree = flattenWebComponents(childComponent);
    tree.children.push(childTree);
  }

  return tree;
}

function buildInnerHTML(tree) {
  if (!tree || !tree.html) {
    return "";
  }

  let innerHTML = tree.html;

  if (tree.children && tree.children.length > 0) {
    for (const child of tree.children) {
      const childHTML = buildInnerHTML(child);
      const tagPlaceholder = `<${child.tagName}></${child.tagName}>`;
      innerHTML = innerHTML.replace(tagPlaceholder, childHTML);
    }
  }

  return innerHTML;
}
function removeHTMLComments(str) {
  return str.replace(/<\!--.*?-->/g, "");
}

function sanitizeHtmlString(inputString) {
  // Replace common HTML escape sequences with their corresponding characters
  const entityMap = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x60;": "`",
    "&#x3C;": "<", // Also replace the unusual hex code
  };

  const sanitizedString = inputString.replace(
    /&(lt|gt|amp|quot|#x27|#x60|#x3C);/g,
    function (match) {
      return entityMap[match];
    }
  );

  // Remove any remaining non-ASCII characters
  const asciiOnlyString = sanitizedString.replace(/[^\x20-\x7E]/g, "");

  return asciiOnlyString;
}

function compareObjects(obj1, obj2) {
  return JSON.stringify(obj1) == JSON.stringify(obj2);
}

function removeLastCharacter(txt) {
  return txt.substr(0, txt.length - 1);
}

const snakeToCamel = (str) => {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );
};

function camelToSnake(text) {
  return text
    .split(/(?=[A-Z])/)
    .join("_") //here i use underscore because if i use "-" when converting the other way around, it may cause a loop
    .toLowerCase();
}

function findMatchingProperty(element, searchString) {
  const lowerCaseSearchString = searchString.toLowerCase();
  for (const property in element) {
    if (property.toLowerCase() == lowerCaseSearchString) return property;
  }

  return null;
}


async function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


function getComponentsNameFromJSClass(elem) {
  try {
    let scriptString = elem.querySelector("script").innerHTML.trim();
    let classString = "class ";
    let numOfCharWhereClass = scriptString.indexOf(classString);
    let cutString = scriptString.substring(
      numOfCharWhereClass + classString.length,
      scriptString.length
    );

    let className = cutString.split(" extends ")[0];
    return className;
  } catch (e) {
    console.error(e);
  }
}


function makeRandomID(){
  return Math.floor(Math.random() * 9999999999999999).toString(24);
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  buildInnerHTML: buildInnerHTML,
  camelToSnake: camelToSnake,
  capitalizeFirstLetter: capitalizeFirstLetter,
  cloneAttributes: cloneAttributes,
  compareObjects: compareObjects,
  convertStringToComponentFriendlyName: convertStringToComponentFriendlyName,
  createTree: createTree$1,
  decodeAttr: decodeAttr,
  duplicate: duplicate,
  encodeAttr: encodeAttr,
  evalInComponent: evalInComponent,
  findMatchingProperty: findMatchingProperty,
  flattenWebComponents: flattenWebComponents,
  getAttributesStartingWith: getAttributesStartingWith,
  getComponentsNameFromJSClass: getComponentsNameFromJSClass,
  getDataFromAPI: getDataFromAPI,
  hasCurlyBrackets: hasCurlyBrackets,
  makeRandomID: makeRandomID,
  moveAllChildrenNodes: moveAllChildrenNodes,
  randomColor: randomColor,
  removeCurlyBrackets: removeCurlyBrackets,
  removeHTMLComments: removeHTMLComments,
  removeLastCharacter: removeLastCharacter,
  replaceAll: replaceAll,
  sanitizeHtmlString: sanitizeHtmlString,
  snakeToCamel: snakeToCamel,
  wait: wait
});

class Component extends HTMLElement {
  static putTagNameInComponentsClass(classs) {
    if (classs && classs != Component && !classs.tagName) {
      classs.tagName = convertStringToComponentFriendlyName(classs.name);
    }
  }

  static tagName;
  constructor() {
    super();

    Component.putTagNameInComponentsClass(new.target);

    this.uid = makeRandomID();
    this.setAttribute("uid", this.uid);

    // this.useEffectListeners = [];
    const nameOfClassThatCalledThis = this.constructor.name;

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML =
      (App.instance.components[nameOfClassThatCalledThis] || {}).html || "";
    this.shadowRoot.componentReference = this;

    try {
      let stylePart =
        App.instance.components[nameOfClassThatCalledThis].css.cloneNode(true);
      stylePart.setAttribute("original-style", 1);
      this.shadowRoot.append(stylePart);
    } catch (e) {}

    this.shadowRoot.append(document.createElement("template"));

    this.setRootElement();
    this.initObsrever();
    this.enable();
    this.updateParsedAttributes();
  }

  enable() {
    if (this.enabled) return;
    //PUT THE ROOT ELEMENT BACK IN THE SHADOWROOT
    if (this.root) {
      this.shadowRoot.appendChild(this.root);
    }
    this.setState("enabled", true);
    this.style.display = this.prevDisplayValue || "";
    this.enabled = true;

    try {
      this.onEnable();
    } catch (e) {
      console.warn(e);
    }
  }

  onEnable() {}
  onDisable() {}

  disable(moveToTemplate) {
    if (!this.enabled) return;
    this.prevDisplayValue =
      this.style.display != "none" ? this.style.display : "";
    //REMOVE FROM SHADOWROOT AND PUT IT IN TEMPLATE
    if (moveToTemplate && this.root) {
      this.$("template").content.appendChild(this.root);
    }
    this.setState("enabled", false);
    this.enabled = false;

    this.style.display = "none";

    try {
      this.onDisable();
    } catch (e) {
      console.warn(e);
    }
  }

  // linkJAttrsWithProperty() {
  //   if (!this.root) return;
  //   this.root.querySelectorAll(":host *").forEach((el) => {
  //     let jAttrs = getAttributesStartingWith(el, "j-");
  //     for (let jAttr of jAttrs) {
  //       if (
  //         jAttr.name.startsWith("j-on") ||
  //         jAttr.name.toLowerCase() == "j-innerhtml"
  //       ) {
  //         continue;
  //       }

  //       let nameOfAttr = jAttr.name.substr(2, 999);

  //       el[nameOfAttr] = evalInComponent(jAttr.value, this);
  //       // console.log(
  //       //   "#########",
  //       //   nameOfAttr,
  //       //   jAttr.value,
  //       //   evalInComponent(jAttr.value, this)
  //       // );
  //     }
  //   });
  // }
  getTree(hideComponent, showState) {
    return createTree(this, hideComponent, showState);
  }

  // linkJEventsWithMethods() {
  //   if (!this.root) return;
  //   this.root.querySelectorAll(":host *").forEach((el) => {
  //     // console.log("%%%%%%%%", this.tagName, el);
  //     let jAttrs = getAttributesStartingWith(el, "j-on");
  //     for (let jAttr of jAttrs) {
  //       //this is the method's name in the class
  //       let methodInClass = jAttr.value;
  //       let nameOfEventListener = jAttr.name.substr(2, 999);
  //       el[nameOfEventListener] = this[methodInClass].bind(this);
  //     }
  //   });
  // }

  // updateJInnerHTML() {
  //   if (!this.root) return;
  //   // UPDATES THE INNERHTML OF ALL ELEMENTS THAT HAVE THE j-innerHTML ATTRIBUTE
  //   this.root
  //     .querySelectorAll(":host *[j-innerHTML]:not(:has(> *))")
  //     .forEach((el) => {
  //       let val = el.getAttribute("j-innerHTML");

  //       let updatedVal = evalInComponent(val, this);

  //       if (el.innerHTML != updatedVal) el.innerHTML = updatedVal;
  //     });
  // }

  setState(varName, val) {
    // console.log("### setState", this.tagName, varName, val);
    let newVal = val;
    if (val instanceof Object) newVal = encodeAttr(val);
    else if (val === undefined || val === null) newVal = 0;

    let converted = camelToSnake(varName);
    if (this.getAttribute(converted) != newVal) {
      this.setAttribute(converted, newVal);
    }
  }
  getState(varName) {
    let ret = (this.state || {})[varName.trim()];

    return ret;
  }

  setCSSVariable(varName, val) {
    if (val instanceof Object) val = encodeAttr(val);
    this.style.setProperty("--" + varName, val);
  }
  getCSSVariable(varName) {
    let elem = this;

    while (elem && !elem.style.getPropertyValue("--" + varName)) {
      elem = elem.getParentComponent();
    }
    if (elem && elem.style.getPropertyValue("--" + varName)) {
      let value = elem.style.getPropertyValue("--" + varName);
      let decoded = decodeAttr(value);
      if (decoded) return decoded;
      return value;
    }

    return null;
  }

  getParentComponent() {
    if (this.parent) return this.parent;
    let obj = this;
    while (obj.parentNode) {
      obj = obj.parentNode;
    }
    let parent = obj.componentReference;
    if (parent instanceof Component) this.parent = parent;

    return parent;
  }
  setRootElement() {
    let constructorsNameElement = this.$(this.constructor.name.toLowerCase());

    this.root = constructorsNameElement;
    if (!this.root) {
      this.root = this.$(":host >*:not(style):not(template)");
    }

    // if (!this.root) debugger;
  }
  passStatesToVars() {
    let keys = Object.keys(this.state);
    for (let key of keys) {
      this[key] = this.state[key];
    }
  }

  updateParsedAttributes() {
    // console.log("### update", this.tagName);
    this.prevState = JSON.parse(JSON.stringify(this.state || {}));
    this.state = {};

    this.observer.disconnect();

    // this.passStatesToVars();

    //CHECK THE ATTRIBUTES OF THE COMPONENT, AND PASS THEM TO THE STATE OBJECT
    Array.from(this.attributes).map((k) => {
      let camelCaseAttrName = snakeToCamel(k.name);
      let decodedAttr = decodeAttr(k.value);
      let trimmedValue = k.value.trim();
      if (hasCurlyBrackets(trimmedValue)) {
        let parent = this.getParentComponent();
        let i = this.getAttribute("i");
        if (parent)
          this.state[camelCaseAttrName] = evalInComponent(k.value, parent, i);
      } else if (decodedAttr) {
        this.state[camelCaseAttrName] = decodedAttr;
      } else if (camelCaseAttrName == "style") ; else if (camelCaseAttrName == "enabled") {
        let value = k.value.length > 0 ? JSON.parse(k.value) : true;
        this.state[camelCaseAttrName] = value;
        if (value) this.enable();
        else this.disable();
      } else {
        try {
          this.state[camelCaseAttrName] = JSON.parse(k.value);
        } catch (e) {
          this.state[camelCaseAttrName] = k.value;
        }

        // this.root.setAttribute(k.name, k.value);
        // this.style.setProperty("--" + k.name, k.value);
      }
    });

    //THESE FUNCTIONS CHECK ALL THE ELEMENTS INSIDE OF THE COMPONENT:
    // this.linkJEventsWithMethods();
    // this.linkJAttrsWithProperty();
    // this.updateJInnerHTML(); //because of uppercase and lower case 'innerHTML' i cannot standarize this with the linkJAttrsWithProperty method
    this.linkJAttrsOfAllElements();
    this.observer.observe(this, this.observerConfig);
  }

  linkJAttrsOfAllElements() {
    //THIS FUNCTION CHECKS THE J-ATTRIBUTES AND ITS CONTENT, LIKE J-INNERHTML
    if (!this.root) return;
    this.root.querySelectorAll(":host *").forEach((el) => {
      const i = el.getAttribute("i");
      let jAttrs = getAttributesStartingWith(el, "j-");

   

      for (let jAttr of jAttrs) {
        //get the result of the expression in the jAttribute
        let updatedVal = evalInComponent(jAttr.value, this, i);
        if (!updatedVal) continue;
        //get the name of the attribute without the "j-"
        let nameOfAttr = jAttr.name.substr(2, 999);

        const matchingProp = findMatchingProperty(el, nameOfAttr);

     
        if (nameOfAttr.toLowerCase() == "style") {
          //STYLE
          if (updatedVal) {
            //sets each style property
            Object.keys(updatedVal).forEach((k) => {
              if (el.style[k] != updatedVal[k]) el.style[k] = updatedVal[k];
            });
          }
        } else if (nameOfAttr.startsWith("on")) {
          //EVENTS

          if (updatedVal instanceof Function) {
            if (el[nameOfAttr] != updatedVal) el[nameOfAttr] = updatedVal;
          } else {
            console.warn("a j-on event listener was not properly assigned");
          }
        } else if (matchingProp) {
          if (el[matchingProp] != updatedVal) el[matchingProp] = updatedVal;
        } else {
          //everything else
          //i'll try to see if converting the snake case to camel case, it exists:
          const attrAsCamelCase = snakeToCamel(nameOfAttr);
          if (attrAsCamelCase in el) {
            if (el[attrAsCamelCase] != updatedVal)
              el[attrAsCamelCase] = updatedVal;
          } else {
            //if not, just put it as property
            if (el[nameOfAttr] !== updatedVal) el[nameOfAttr] = updatedVal;
          }
        }
      }
    });
  }
  getAllChildrenComponents() {
    if (!this.root) return [];
    return Array.from(this.root.querySelectorAll("*")).filter((k) => {
      return (
        k instanceof Component
        // k.parentNode instanceof DocumentFragment
      );
    });
  }

  getAllElements() {
    return Array.from(
      this.shadowRoot.querySelectorAll(":host > *:not(template):not(style)")
    );
  }

  checkWhatAttributesChanged() {
    // USE EFFECT TRICK:

    let ret = {};

    let parsedAttrKeys = Object.keys(this.state);
    let prevParsedAttrKeys = Object.keys(this.prevState);

    for (let p of parsedAttrKeys) {
      let current = this.state[p];
      let prev = this.prevState[p];
      if (JSON.stringify(current) != JSON.stringify(prev)) {
        ret[p] = { prev, current };
      }
    }

    //IN CASE SOME ATTRBIUTE IS NOT THERE ANY MORE, THIS IS THE WAY I TRACK IT
    for (let p of prevParsedAttrKeys) {
      //IF THE PROPERTY IS NOT PRESENT IN THE RET OBJECT
      if (!ret[p]) {
        //I CHECK IF THEY CHANGED
        let current = this.state[p];
        let prev = this.prevState[p];
        if (JSON.stringify(current) != JSON.stringify(prev)) {
          ret[p] = { prev, current };
        }
      }
    }

    return ret;
  }

  updateIfTagsInThisComponent() {
    let ifs = this.shadowRoot.querySelectorAll("j-if");
    ifs.forEach((k) => k.update());
  }
  saveLog(attrs) {
    if (!App.instance.log) App.instance.log = [];
    App.instance.log.push({
      type: this.constructor.name,
      id: this.uid,
      attrs,
      when: performance.now(),
    });
  }
  update() {
    this.updateParsedAttributes();

    let attrs = this.checkWhatAttributesChanged();

    this.updateIfTagsInThisComponent();
    // if (this  instanceof JURL.ForTag ) this.executeForFunctionality();

    if (Object.keys(attrs).length == 0) return;

    if (App.instance.saveLog) this.saveLog(attrs);

    if (this.onChange instanceof Function) {
      try {
        this.onChange(attrs);
      } catch (e) {
        console.warn(e);
      }
    }

    // if (!this.isEnabled()) return;

    //AND THIS KEEPS GOING ALL THE WAY DOWN THE TREE
    for (let c of this.getAllChildrenComponents()) {
      if (c.update instanceof Function && c.isEnabled()) c.update();
    }
  }

  handleOnChange(mutationList) {
    // console.log("mutat", mutationList);
    for (const mutation of mutationList) {
      if (mutation.type === "childList") ; else if (mutation.type === "attributes") {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        this.update();
        // console.log(this.state);
      }
    }
  }

  initObsrever() {
    this.observerConfig = {
      attributes: true,
      childList: false,
      subtree: false,
    };

    // Create an observer instance linked to the callback function
    this.observer = new MutationObserver((e) => this.handleOnChange(e));

    // Start observing the target node for configured mutations
    this.observer.observe(this, this.observerConfig);

    // Later, you can stop observing
    // observer.disconnect();
  }
  setRoot(el) {
    this.root = el;
  }

  // replaceCurlyBracketsWithContent() {
  //   // console.log("#### replace curly brackets");
  //   if (!this.root) return;

  //   // if (this  instanceof JURL.ForTag ) {
  //   //   // console.log("# do not change content of {{}} for forTAgs");
  //   //   return;
  //   // }

  //   let elementsWithNoChildrenAndCurlyBracketsContent = Array.from(
  //     this.root.querySelectorAll(":host *:not(style)")
  //   ).filter(
  //     (el) => el.childElementCount == 0 && el.innerText.indexOf("{{") > -1
  //   );
  //   if (elementsWithNoChildrenAndCurlyBracketsContent.length == 0) return;
  //   for (let el of elementsWithNoChildrenAndCurlyBracketsContent) {
  //     if (el.parentNode instanceof JFor) return;

  //     let whereAreTheCurlyBrStarting = el.innerText.indexOf("{{");
  //     let whereAreTheCurlyBrEnding = el.innerText.indexOf("}}");
  //     let varInsideCurlyBr = el.innerText.substr(
  //       whereAreTheCurlyBrStarting + 2,
  //       whereAreTheCurlyBrEnding - whereAreTheCurlyBrStarting - 2
  //     );
  //     let value = this.getState(varInsideCurlyBr);

  //     // console.log(
  //     //   "!!!!!!!",
  //     //   el.innerText,
  //     //   whereAreTheCurlyBrStarting,
  //     //   whereAreTheCurlyBrEnding,
  //     //   varInsideCurlyBr,
  //     //   value
  //     // );
  //     el.innerText = el.innerText.replace(
  //       "{{" + varInsideCurlyBr + "}}",
  //       value
  //     );
  //   }
  // }

  connectedCallback() {
    App.instance.instanciatedComponents.add(this);
    setTimeout(() => {
      this.updateParsedAttributes();

      if (this.onInit instanceof Function) {
        try {
          this.onInit();
        } catch (e) {
          console.warn(e);
        }
      }
    }, 1);
  }

  disconnectedCallback() {
    this.observer.disconnect();
    App.instance.instanciatedComponents.delete(this);

    if (this.onDestroy instanceof Function) {
      try {
        this.onDestroy();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  $(sel) {
    let res = this.shadowRoot.querySelectorAll(sel);
    if (res.length > 1) return Array.from(res);
    if (res.length == 1) return res[0];
    return null;
  }

  isEnabled() {
    return this.getState("enabled");
  }

  static create(attrs) {
    // console.log(this.name);
    let elem = App.instance.createComponent(
      "<" + convertStringToComponentFriendlyName(this.name) + " />"
    );

    if (attrs instanceof Object) {
      let keys = Object.keys(attrs);
      for (let key of keys) {
        let value = attrs[key];
        if (value instanceof Object) {
          value = encodeAttr(value);
        }
        elem.setAttribute(key, value);
      }
    }
    return elem;
  }
}

window.JURL = { ...window.JURL, Component };

class JFor extends Component {
  // static tagName = "j-for";

  constructor() {
    super(true);
    this.root = this.shadowRoot;
  }

  onInit() {
    if (!this.originalContent) {
      this.originalContent = duplicate(this.innerHTML);
    }

    this.copyStylesFromParent();
    this.executeForFunctionality();

    this.innerHTML = "";
  }
  copyStylesFromParent() {
    let parent = this.getParentComponent();
    let style, cloned;

    if (parent) {
      let doIHaveThisStyleAlready = this.$(
        "style[belongs-to-parent='" + parent.uid + "'"
      );
      if (doIHaveThisStyleAlready) {
        return;
      }
      style = parent.$("style");

      if (style && (style.innerHTML || "").length > 3) {
        cloned = style.cloneNode(true);
        cloned.setAttribute("belongs-to-parent", parent.uid);
        cloned.removeAttribute("original-style");
        this.shadowRoot.appendChild(cloned);
      }
    }
  }
  onChange(e) {
    if (e.arr) this.executeForFunctionality();
  }

  executeForFunctionality() {
    let arr = this.getState("arr");
    if (!Array.isArray(arr)) return;
    let currentChildren = this.getAllElements();
    if (arr.length == currentChildren.length) {
      //THERE'S THE SAME NUMBER OF ELEMENTS RIGHT NOW, AS THE NUMBER OF ELEMENTS THAT SHOULD BE
      this.update();
    } else if (arr.length < currentChildren.length) {
      //REMOVING ELEMENTS
      let childrenToRemove = currentChildren.splice(
        arr.length,
        currentChildren.length
      );

      childrenToRemove.forEach((k) => this.root.removeChild(k));
      this.update();
    } else if (arr.length > currentChildren.length) {
      //ADDING ELEMENTS
      if (!this.originalContent) return;

      let numberOfChildrenToAdd = arr.length - currentChildren.length;
      for (let i = 0; i < numberOfChildrenToAdd; i++) {
        let elem = App.instance.createComponent(this.originalContent);
        //SETS THE I ATTRIBUTE
        elem.setAttribute("i", currentChildren.length + i);
        this.root.appendChild(elem);
        //ADD THE ITEM AS AN ATTRIBUTE
        elem.setAttribute("item", "{{this.state.arr[i]}}");
      }
      this.update();
    } else if (arr.length == 0) {
      //REMOVE ALL IF ARR.LENGTH==0
      this.root.innerHTML = "";
    }
  }
}

window.JURL = { ...window.JURL, JFor };

class JIf extends HTMLElement {
  // static get observedAttributes() {
  //   return ["condition"];
  // }

  // static tagName = "j-if";

  constructor() {
    super();

    window.ifCompo = this;

    // console.log("construcotr", performance.now());
  }

  initObsrever() {
    this.observerConfig = {
      attributes: true,
      childList: false,
      subtree: false,
    };

    // Create an observer instance linked to the callback function
    this.observer = new MutationObserver((e) => this.update());

    // Start observing the target node for configured mutations
    this.observer.observe(this, this.observerConfig);

    // Later, you can stop observing
    // observer.disconnect();
  }
  disconnectedCallback() {
    // console.log(this.constructor.name, this.uid, "died", this);

    this.observer.disconnect();
    App.instance.instanciatedComponents.delete(this);

    if (this.onDestroy instanceof Function) this.onDestroy();
  }

  connectedCallback() {
    // console.log("connected callback", performance.now());

    this.savedOuterHTML = this.outerHTML;
    this.initObsrever();
    this.update();
  }

  // attributeChangedCallback(name, oldValue, newValue) {
  //   console.log("###", this)
  //   this.update();
  // }

  update() {
    let parentComponent = this.getParentComponent();
    // console.log("update", performance.now(), parentComponent);
    let condition = this.getAttribute("condition");
    let i = this.getAttribute("i");
    if (condition.length > 1 && parentComponent) {
      let evalled = evalInComponent(condition, parentComponent, i);
      // console.log("!!!! if", this, parentComponent, i, evalled, condition);
      this.handleConditionChanged(evalled);
    }
  }

  handleConditionChanged(conditionValue) {
    // console.log("handle condition changed", conditionValue, this);
    if (conditionValue) {
      //MAKE CONTENT VISIBLE:
      this.style.display = "";
    } else {
      this.style.display = "none";
    }
  }

  getParentComponent() {
    let obj = this;
    while (obj.parentNode) {
      obj = obj.parentNode;
    }
    return obj.componentReference;
  }
}


window.JURL={...window.JURL, JIf};

//COMPONENT USED TO SHOW DEBUG JSONS
class JDebug extends Component {
  static tagName = "j-debug";
  constructor() {
    super();
    this.root = this.shadowRoot;
    this.preElement = document.createElement("pre");
    this.shadowRoot.appendChild(this.preElement);
  }

  onInit() {
    this.update();
  }

  update() {
    this.preElement.innerHTML = JSON.stringify(
      evalInComponent(this.innerHTML, this.getParentComponent()),
      null,
      2
    );
  }
}

window.JURL = { ...window.JURL, JDebug };

window.JURL = { ...window.JURL, utils };




class App {
  instance = null;
  static registeredCustomElements = {};
  constructor(options) {
    if (App.instance) return App.instance;
    this.log = [];
    Object.assign(this, options);

    if (!this.root) {
      console.error("the app was initialized without root");
    }

    this.registerCustomElements();

    this.cutAppsContentWhileItLoads();
    this.components = {};
    this.instanciatedComponents = new Set();
    App.instance = this;
    this.DOMparser = new DOMParser();
  }
  registerCustomElements() {
    App.defineComponentsName(JFor, "j-for");
    App.defineComponentsName(JIf, "j-if");
    App.defineComponentsName(JDebug, "j-debug");
  }
  getTreeOfComponents(simple, showState) {
    return createTree$1(this.root, simple, showState);
  }

  init() {
    // this.root.innerHTML = this.content;
    const mainComponentsTagName = "app-main";
    //I USE THE COMPONENT CLASS TO DEFINE AN BLANK, HOLLOW, COMPONENT, WHICH WILL BE THE MAIN COMPONENT OF THE APP
    //THE IDEA IS TO BE ABLE TO USE THE COMPONENT'S FUNCTIONALITIES IN THE MAIN APP AS WELL
    App.defineComponentsName(Component, mainComponentsTagName);
    //CREATE THE COMPONENT
    this.mainComponent = this.createComponent(
      "<" + mainComponentsTagName + "></" + mainComponentsTagName + ">"
    );
    //APPEND IT SO IT TRIGGERS THE CONNECTEDCALLBACK
    this.root.appendChild(this.mainComponent);

    //COPY ATTRIBUTES
    cloneAttributes(this.mainComponent, this.root);

    //REPLACE THE ROOT
    this.root.replaceWith(this.mainComponent);
    //ONLY NOW, AS LAST, INSERT THE HTML CODE, SO THE COMPONENTS ONLY GET INSTANCED ONCE
    this.mainComponent.shadowRoot.innerHTML =
      "<span>" + this.content + "</span>";
    //I NEED TO SET BY HAND, BECAUSE WHEN THE MAIN COMPONENT GETS INSTANCIATED IT DOESN'T HAVE ANY CONTENT
    this.mainComponent.setRoot(this.mainComponent.shadowRoot.children[0]);
    this.root = this.mainComponent;
  }

  cutAppsContentWhileItLoads() {
    this.content = this.root.innerHTML;

    this.root.innerHTML = "";
  }

  getAndLoadScripts(nameOfHTML, elem) {
    let scripts = elem.querySelectorAll(" script");
    scripts.forEach((script) => {
      let newScript = document.createElement("script");
      newScript.type = "module";
      // console.log(script)
      //THIS LINE AUTOMATICALLY REGISTERS THE COMPONENT

      script.innerHTML +=
        " \n try{App.defineComponentsName(" +
        nameOfHTML +
        ") }catch(e){window.JURL.App.defineComponentsName(" +
        nameOfHTML +
        ") ;};";

      newScript.innerHTML = script.innerHTML;
      if (script.src) newScript.src = script.src;
      newScript.setAttribute("belongs_to", nameOfHTML);
      newScript.classList.add("script_" + nameOfHTML);

      document.head.appendChild(newScript);
    });
    elem.querySelectorAll("script").forEach((k) => k.remove());
  }

  createComponent(txt) {
    return this.DOMparser.parseFromString(txt, "text/html").body.children[0];
  }

  async loadManyComponents(arr) {
    let arrOfPromises = [];
    for (let co of arr) {
      arrOfPromises.push(this.loadComponent(co));
    }
    try {
      await Promise.all(arrOfPromises);
      return 1;
    } catch (e) {
      console.warn(e);
      return 0;
    }
  }

  getComponentFromURL(url) {
    let arr = Object.keys(this.components)
      .map((key) => {
        return this.components[key];
      })
      .filter((c) => c.path == url);

    if (arr.length > 0) return arr[0];
  }

  async loadComponent(url, options = {}) {
    if (this.getComponentFromURL(url)) {
      return 1;
    }

    let req;
    try {
      req = await fetch(url + "?fd=" + Math.random() * 99999);
    } catch (e) {
      console.warn(e);
      return 0;
    }
    let content = await req.text();
    let elem = document.createElement("html");
    elem.innerHTML = content;

    let nameOfHTML = getComponentsNameFromJSClass(elem);

    if (this.components[nameOfHTML]) {
      console.warn("the component " + nameOfHTML + " was already loaded");
      return 1;
    }

    this.getAndLoadScripts(nameOfHTML, elem);

    //DEAL WITH STYLES:

    let style = (
      elem.querySelector("head style") || document.createElement("style")
    ).cloneNode(true);

    this.components[nameOfHTML] = {
      html: elem.querySelector("body").innerHTML,
      css: style,
      path: url,
    };

    // this.checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded(nameOfHTML);
    // await utils.wait(1)
    return App.waitUntilComponentIsActuallyRegistered(
      convertStringToComponentFriendlyName(nameOfHTML)
    );
    // return 1;
  }
  // checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded(name) {
  //   console.log("#checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded", name);

  //   // let classNameOfNewCompo = eval(name);
  //   // let arr = this.instanciatedComponents.filter(
  //   //   (k) => k instanceof classNameOfNewCompo
  //   // );
  //   // if (arr.length > 0) {
  //   //   arr[0].outerHTML += " ";
  //   // }

  //   this.instanciatedComponents.forEach((k) => {
  //     if (
  //       k.tagName.toLowerCase() == convertStringToComponentFriendlyName(name)
  //     ) {
  //       k.outerHTML += " ";
  //     }
  //   });
  // }

  static defineComponentsName(classs, name) {
    const newName =
      name ||
      classs.tagName ||
      convertStringToComponentFriendlyName(classs.name);

    console.log("defineComponentsName", classs.name, newName);

    if (
      App.registeredCustomElements[newName] ||
      Object.values(App.registeredCustomElements).includes(classs)
    ) {
      return console.warn("the component " + newName + " was already defined");
    }

    customElements.define(newName, classs);

    App.registeredCustomElements[newName] = classs;
  }

  static async waitUntilComponentIsActuallyRegistered(tagName) {
    if (App.registeredCustomElements[tagName]) return true;
    const max = 200;
    const msDif = 10;
    let count = 0;

    return new Promise((resolve) => {
      const check = () => {
        // console.log("### check", tagName,count, max, performance.now());
        if (App.registeredCustomElements[tagName]) {
          // console.log("## ",tagName,"ready")
          resolve(true); // Resolves the promise when the condition is met
        } else {
          count += msDif;
          if (count > max) {
            resolve(false);
          } else {
            setTimeout(check, msDif); // Check again after 1 ms
          }
        }
      };

      check();
    });
  }
}

window.JURL = { ...window.JURL, App };
const JURL=window.JURL;

export { App, JURL as default };
