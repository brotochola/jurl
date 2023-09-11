class Component extends HTMLElement {
  constructor() {
    // console.log("constructor Component!");
    super();

    this.uid = Math.floor(Math.random() * 9999999999999999).toString(24);

    // this.useEffectListeners = [];
    const nameOfClassThatCalledThis = this.constructor.name.toLowerCase();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = app.components[nameOfClassThatCalledThis].html;
    this.shadowRoot.componentReference = this;
    //STYLE:
    this.shadowRoot.append(
      app.components[nameOfClassThatCalledThis].css.cloneNode(true)
    );

    this.setAttribute("uid", this.uid);

    app.instanciatedComponents.push(this);
    this.setRootElement();
    this.initObsrever();
    this.updateParsedAttributes();
    // console.log(Array.from(this.attributes));
  }
  setCSSVariable(varName, val) {
    this.style.setProperty("--" + varName, val);
  }
  getCSSVariable(varName) {
    let elem = this;
    while (elem && !elem.style.getPropertyValue("--" + varName)) {
      elem = elem.getParentComponent();
    }
    if (elem && elem.style.getPropertyValue("--" + varName)) {
      return elem.style.getPropertyValue("--" + varName);
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
      this.root = this.$(":host >*:not(style)");
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
      if (k.value.endsWith("}}") && k.value.startsWith("{{")) {
        //CURLY BRACKETS VARIABLES
        let val = k.value.substr(2, k.value.length - 4);

        try {
          this.parsedAttributes[k.name] =
            this.getParentComponent().getAttribute(val);
          // this.getParentComponent()[val];
        } catch (e) {
          // console.warn(e);
        }
      } else if (k.value.startsWith("%") && decodeAttr(k.value)) {
        this.parsedAttributes[k.name] = decodeAttr(k.value);
      } else if (k.name == "style") {
      } else {
        this.parsedAttributes[k.name] = k.value;
        // this.root.setAttribute(k.name, k.value);
        this.style.setProperty("--" + k.name, k.value);
      }
    });

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
  connectedCallback() {
    // console.log(this.constructor.name, this.uid, "appeared");

    setTimeout(() => {
      this.updateParsedAttributes();
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

  // attributeChangedCallback(attrName, oldVal, newVal) {
  //   console.log("attr changed", this.uid, attrName, oldVal, newVal);
  // }

  // getElementInDOM() {
  //   let elem = app.root.querySelector("*[uid='" + this.uid + "']");
  //   elem.instanceReference = this;
  //   return elem;
  // }

  $(sel) {
    let res = this.shadowRoot.querySelectorAll(sel);
    if (res.length > 1) return Array.from(res);
    if (res.length == 1) return res[0];
    return null;
  }
}
