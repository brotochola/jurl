class Component extends HTMLElement {
  constructor() {
    // console.log("constructor Component!");
    super();

    this.uid = Math.floor(Math.random() * 9999999999999999).toString(24);

    // this.useEffectListeners = [];
    const nameOfClassThatCalledThis = this.constructor.name; //.toLowerCase();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = app.components[nameOfClassThatCalledThis].html;
    this.shadowRoot.componentReference = this;

    this.shadowRoot.append(
      app.components[nameOfClassThatCalledThis].css.cloneNode(true)
    );

    this.shadowRoot.append(document.createElement("template"));

    this.setAttribute("uid", this.uid);

    app.instanciatedComponents.push(this);
    this.setRootElement();
    this.initObsrever();

    this.updateParsedAttributes();
    this.enabled = true;
  }
  enable() {
    this.shadowRoot.appendChild(this.root);
    this.enabled = true;
  }

  disable() {
    this.$("template").content.appendChild(this.root);
    this.enabled = false;
  }

  linkJEventsWithMethods() {
    this.root.querySelectorAll(":host *").forEach((el) => {
      let jAttrs = getAttributesStartingWithJ(el);
      for (let jAttr of jAttrs) {
        //this is the method's name in the class
        let methodInClass = jAttr.value;
        let nameOfEventListener = jAttr.name.substr(2, 999);
        el[nameOfEventListener] = this[methodInClass].bind(this);
      }
    });
  }

  setState(varName, val) {
    if (val instanceof Object) val = encodeAttr(val);
    this.setAttribute(varName, val);
  }
  getState(varName) {
    return this.parsedAttributes[varName];
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
    let obj = this;
    while (obj.parentNode) {
      obj = obj.parentNode;
    }
    return obj.componentReference;
  }
  setRootElement() {
    let constructorsNameElement = this.$(this.constructor.name.toLowerCase());

    this.root = constructorsNameElement;
    if (!this.root) {
      this.root = this.$(":host >*:not(style):not(template)");
    }

    // if (!this.root) debugger;
  }

  updateParsedAttributes() {
    this.prevParsedAttributes = JSON.parse(
      JSON.stringify(this.parsedAttributes || {})
    );
    this.parsedAttributes = {};

    this.observer.disconnect();

    Array.from(this.attributes).map((k) => {
      let decodedAttr = decodeAttr(k.value);
      if (k.value.endsWith("}}") && k.value.startsWith("{{")) {
        //CURLY BRACKETS VARIABLES
        let val = k.value.substr(2, k.value.length - 4);

        try {
          this.parsedAttributes[k.name] =
            this.getParentComponent().getAttribute(val);
          // this.getParentComponent()[val];
        } catch (e) {
          // console.warn(e);
          this.parsedAttributes[k.name] = undefined;
        }
      } else if (k.value.startsWith("%") && decodedAttr) {
        this.parsedAttributes[k.name] = decodedAttr;
      } else if (k.name == "style") {
        //DO NOTHING IF IT'S A STYLE ATTR
      } else {
        this.parsedAttributes[k.name] = k.value;
        // this.root.setAttribute(k.name, k.value);
        // this.style.setProperty("--" + k.name, k.value);
      }
    });

    this.linkJEventsWithMethods();
    this.observer.observe(this, this.observerConfig);
  }

  getAllChildrenComponents() {
    return Array.from(this.root.querySelectorAll("*")).filter((k) =>
      k.tagName.toLowerCase().startsWith("app-")
    );
  }

  checkWhatAttributesChanged() {
    // USE EFFECT TRICK:

    let ret = {};

    let parsedAttrKeys = Object.keys(this.parsedAttributes);
    let prevParsedAttrKeys = Object.keys(this.prevParsedAttributes);

    // console.log(parsedAttrKeys, prevParsedAttrKeys);

    for (let p of parsedAttrKeys) {
      let current = this.parsedAttributes[p];
      let prev = this.prevParsedAttributes[p];
      if (JSON.stringify(current) != JSON.stringify(prev)) {
        ret[p] = { prev, current };
      }
    }

    //IN CASE SOME ATTRBIUTE IS NOT THERE ANY MORE, THIS IS THE WAY I TRACK IT
    for (let p of prevParsedAttrKeys) {
      //IF THE PROPERTY IS NOT PRESENT IN THE RET OBJECT
      if (!ret[p]) {
        //I CHECK IF THEY CHANGED
        let current = this.parsedAttributes[p];
        let prev = this.prevParsedAttributes[p];
        if (JSON.stringify(current) != JSON.stringify(prev)) {
          ret[p] = { prev, current };
        }
      }
    }

    return ret;
  }

  update() {
    this.updateParsedAttributes();
    if (this.onChange instanceof Function) {
      let attrs = this.checkWhatAttributesChanged();
      this.onChange(attrs);
    }

    //AND THIS KEEPS GOING ALL THE WAY DOWN THE TREE
    for (let c of this.getAllChildrenComponents()) {
      if (c.update instanceof Function) c.update();
    }
  }

  handleOnChange(mutationList) {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        // console.log("A child node has been added or removed.");
      } else if (mutation.type === "attributes") {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        this.update();
        // console.log(this.parsedAttributes);
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

  replaceCurlyBracketsWithContent() {
    let elementsWithNoChildrenAndCurlyBracketsContent = Array.from(
      this.root.querySelectorAll(":host *:not(style)")
    ).filter(
      (el) => el.childElementCount == 0 && el.innerText.indexOf("{{") > -1
    );
    if (elementsWithNoChildrenAndCurlyBracketsContent.length == 0) return;
    for (let el of elementsWithNoChildrenAndCurlyBracketsContent) {
      let whereAreTheCurlyBrStarting = el.innerText.indexOf("{{");
      let whereAreTheCurlyBrEnding = el.innerText.indexOf("}}");
      let varInsideCurlyBr = el.innerText.substr(
        whereAreTheCurlyBrStarting + 2,
        whereAreTheCurlyBrEnding - whereAreTheCurlyBrStarting - 2
      );
      let value = this.parsedAttributes[varInsideCurlyBr.toLowerCase()];

      // console.log(
      //   "!!!!!!!",
      //   el.innerText,
      //   whereAreTheCurlyBrStarting,
      //   whereAreTheCurlyBrEnding,
      //   varInsideCurlyBr,
      //   value
      // );
      el.innerText = el.innerText.replace(
        "{{" + varInsideCurlyBr + "}}",
        value
      );
    }
  }

  connectedCallback() {
    // console.log(this.constructor.name, this.uid, "appeared");

    setTimeout(() => {
      this.updateParsedAttributes();
      this.replaceCurlyBracketsWithContent();
      if (this.onInit instanceof Function) this.onInit();
    }, 1);
  }

  disconnectedCallback() {
    // console.log(this.constructor.name, this.uid, "died", this);

    this.observer.disconnect();
    app.instanciatedComponents = app.instanciatedComponents.filter(
      (k) => k.getAttribute("uid") != this.getAttribute("uid")
    );

    if (this.onDestroy instanceof Function) this.onDestroy();
  }

  $(sel) {
    let res = this.shadowRoot.querySelectorAll(sel);
    if (res.length > 1) return Array.from(res);
    if (res.length == 1) return res[0];
    return null;
  }

  static create(attrs) {
    // console.log(this.name);
    let elem = app.createComponent(
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
