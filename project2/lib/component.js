import { App } from "./app.js";
import {
  camelToSnake,
  snakeToCamel,
  encodeAttr,
  decodeAttr,
  hasCurlyBrackets,
  evalInComponent,
  getAttributesStartingWith,
  convertStringToComponentFriendlyName,
  makeRandomID,
  findMatchingProperty,
  watchElementRemoval,
} from "./utils.js";

export default class Component extends HTMLElement {
  static putTagNameInComponentsClass(classs) {
    if (classs && classs != Component && !classs.tagName) {
      classs.tagName = convertStringToComponentFriendlyName(classs.name);
    }
  }

  static tagName;
  constructor() {
    super();
    console.log("#constructor", this.tagName, this.uid);

 

    App.instance.allComponentsEverCreated.push(this);
    Component.putTagNameInComponentsClass(new.target);

    this.uid = makeRandomID();
    this.setAttribute("uid", this.uid);

    const nameOfClassThatCalledThis = this.constructor.name;

    this.attachShadow({ mode: "open" });

    console.log(
      "# start to mess around with innerHMTL",
      this.tagName,
      this.uid
    );

    this.shadowRoot.innerHTML =
      (App.instance.components[nameOfClassThatCalledThis] || {}).html || "";

    this.shadowRoot.componentReference = this;

    console.log(
      "# finished  to mess around with innerHMTL",
      this.tagName,
      this.uid
    );

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
    // this.updateParsedAttributes();

    this.waitALittleUpdateAndTriggerOnInit();

    // if (new.target.name) {
    //   // debugger
    // }
  }
  waitALittleUpdateAndTriggerOnInit() {
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

  enable() {
    console.log("#enable", this.tagName, this.uid);
    if (this.enabled) return;
    //PUT THE ROOT ELEMENT BACK IN THE SHADOWROOT
    if (this.root instanceof HTMLElement) {
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
    console.log("#disable", this.tagName, this.uid);

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

  getTree(hideComponent, showState) {
    return createTree(this, hideComponent, showState);
  }

  setState(varName, val) {
    console.log("### setState", this.tagName, varName, val);
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
  }

  updateParsedAttributes() {
    // console.log("### update", this.tagName);
    this.prevState = JSON.parse(JSON.stringify(this.state || {}));
    this.state = {};

    this.observer.disconnect();

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
      } else if (camelCaseAttrName == "style") {
        //DO NOTHING IF IT'S A STYLE ATTR
      } else if (camelCaseAttrName == "enabled") {
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
      }
    });

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
    return Array.from(
      this.shadowRoot.querySelectorAll(":host *:not(template):not(style)")
    ).filter((k) => {
      return k instanceof Component;
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
    console.log("#update", this.tagName, this.uid);
    this.updateParsedAttributes();
    this.updateIfTagsInThisComponent();

    let attrs = this.checkWhatAttributesChanged();

    // if (this  instanceof JURL.ForTag ) this.executeForFunctionality();

    if (Object.keys(attrs).length) {
      if (App.instance.saveLog) this.saveLog(attrs);

      if (this.onChange instanceof Function) {
        try {
          this.onChange(attrs);
        } catch (e) {
          console.warn(e);
        }
      }
    }

    // if (!this.isEnabled()) return;

    //AND THIS KEEPS GOING ALL THE WAY DOWN THE TREE
    // console.log("#my children", this.tagName, this.uid, this.getAllChildrenComponents())
    for (let c of this.getAllChildrenComponents()) {
      // console.log("#updating", c.tagName, c.uid)
      if (c.update instanceof Function && c.isEnabled()) c.update();
    }
  }

  handleOnChange(mutationList) {
    // console.log("mutat", mutationList);
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        // console.log("A child node has been added or removed.");
      } else if (mutation.type === "attributes") {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        this.update();
        // console.log(this.state);
      }
    }
  }

  initObsrever() {
    console.log("#init observer", this.tagName, this.uid);
    this.observerConfig = {
      attributes: true,
      childList: false,
      subtree: false,
    };

    // Create an observer instance linked to the callback function
    this.observer = new MutationObserver((e) => this.handleOnChange(e));

    // Start observing the target node for configured mutations
    this.observer.observe(this, this.observerConfig);
  }

  // connectedCallback() {
  //   console.log("#connected", this.tagName, this.uid);

  //   App.instance.instanciatedComponents.add(this);
  //   setTimeout(() => {
  //     this.updateParsedAttributes();

  //     if (this.onInit instanceof Function) {
  //       try {
  //         this.onInit();
  //       } catch (e) {
  //         console.warn(e);
  //       }
  //     }
  //   }, 1);
  // }

  disconnectedCallback() {
    console.log("#disconnected", this.tagName, this.uid);
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

  copyStylesFromParent() {
    console.log("#copyStylesFromParent", this.tagName, this.uid);
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

  // static create(attrs) {
  //   // console.log(this.name);
  //   console.log("#static create", this.tagName, this.uid);
  //   let elem = App.instance.createComponent(
  //     "<" + convertStringToComponentFriendlyName(this.name) + " />"
  //   );

  //   if (attrs instanceof Object) {
  //     let keys = Object.keys(attrs);
  //     for (let key of keys) {
  //       let value = attrs[key];
  //       if (value instanceof Object) {
  //         value = encodeAttr(value);
  //       }
  //       elem.setAttribute(key, value);
  //     }
  //   }
  //   return elem;
  // }
}

window.JURL = { ...window.JURL, Component };
