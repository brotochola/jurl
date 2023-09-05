class Component extends HTMLElement {
  constructor() {
    // console.log("constructor Component!");
    super();

    this.uid = Math.floor(Math.random() * 999999999);

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

  getParentComponent() {
    let obj = this;
    while (obj.parentNode) {
      obj = obj.parentNode;
    }
    return obj.componentReference;
  }
  setRootElement() {
    this.root = this.$(this.constructor.name.toLowerCase());
  }
  updateParsedAttributes() {
    this.parsedAttributes = {};

    this.observer.disconnect();

    Array.from(this.attributes).map((k) => {
      if (k.value.endsWith("}}") && k.value.startsWith("{{")) {
        //CURLY BRACKETS VARIABLES
        let val = k.value.substr(2, k.value.length - 4);

        try {
          this.parsedAttributes[k.name] =
            this.getParentComponent().getAttribute(val);
        } catch (e) {
          // console.warn(e);
        }
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

  update() {
    this.updateParsedAttributes();
    if (this.onChange instanceof Function) {
      this.onChange(this.parsedAttributes);
    }
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
    setTimeout(() => this.updateParsedAttributes(), 1);
    if (this.onInit instanceof Function) this.onInit();
  }
  disconnectedCallback() {
    // console.log(this.constructor.name, this.uid, "died", this);

    this.observer.disconnect();
    app.instanciatedComponents = app.instanciatedComponents.filter(
      (k) => k.getAttribute("uid") != this.getAttribute("uid")
    );
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("attr changed", this.uid, attrName, oldVal, newVal);
  }

  // getElementInDOM() {
  //   let elem = app.root.querySelector("*[uid='" + this.uid + "']");
  //   elem.instanceReference = this;
  //   return elem;
  // }

  $(sel) {
    let res = this.shadowRoot.querySelectorAll(sel);
    if (res.length > 1) return res;
    if (res.length == 1) return res[0];
    return null;
  }
}
