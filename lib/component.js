window.JURL = {
  ...(window.JURL || {}),
  Component: class Component extends HTMLElement {
    constructor() {
      // console.log("constructor Component!");
      super();

      this.uid = Math.floor(Math.random() * 9999999999999999).toString(24);
      this.setAttribute("uid", this.uid);

      this.state = {};

      // this.useEffectListeners = [];
      const nameOfClassThatCalledThis = this.constructor.name; //.toLowerCase();

      this.attachShadow({ mode: "open" });

      this.shadowRoot.innerHTML =
        (JURL.instance.components[nameOfClassThatCalledThis] || {}).html || "";
      this.shadowRoot.componentReference = this;

      try {
        let stylePart =
          JURL.instance.components[nameOfClassThatCalledThis].css.cloneNode(
            true
          );
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
      if (this.root) this.shadowRoot.appendChild(this.root);
      this.setState("enabled", true);
      this.style.display = this.prevDisplayValue || "";
      this.enabled = true;
      this.onEnable();
    }

    onEnable() {}
    onDisabled() {}

    disable() {
      if (!this.enabled) return;
      this.prevDisplayValue =
        this.style.display != "none" ? this.style.display : "";
      if (this.root) this.$("template").content.appendChild(this.root);
      this.setState("enabled", false);
      this.enabled = false;

      this.style.display = "none";
      this.onDisabled();
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

      if (this.getAttribute(varName) != newVal) {
        this.setAttribute(varName, newVal);
      }
    }
    getState(varName) {
      let ret = (this.state || {})[varName.trim().toLowerCase()];
      // if (ret == undefined) {
      //   ret = this.getAttribute(varName.toLowerCase());
      // }
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
      if (parent instanceof JURL.Component) this.parent = parent;

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
        let decodedAttr = decodeAttr(k.value);
        let trimmedValue = k.value.trim();
        if (hasCurlyBrackets(trimmedValue)) {
          let parent = this.getParentComponent();
          let i = this.getAttribute("i");
          if (parent) this.state[k.name] = evalInComponent(k.value, parent, i);
        } else if (decodedAttr) {
          this.state[k.name] = decodedAttr;
        } else if (k.name == "style") {
          //DO NOTHING IF IT'S A STYLE ATTR
        } else if (k.name == "enabled") {
          let value = k.value.length > 0 ? JSON.parse(k.value) : true;
          this.state[k.name] = value;
          if (value) this.enable();
          else this.disable();
        } else {
          try {
            this.state[k.name] = JSON.parse(k.value);
          } catch (e) {
            this.state[k.name] = k.value;
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
      if (!this.root) return;
      this.root.querySelectorAll(":host *").forEach((el) => {
        const i = el.getAttribute("i");
        let jAttrs = getAttributesStartingWith(el, "j-");
        for (let jAttr of jAttrs) {
          let updatedVal = evalInComponent(jAttr.value, this, i);

          let nameOfAttr = jAttr.name.substr(2, 999);

          // console.log(
          //   "%%%%%%%%",
          //   this.tagName,
          //   jAttr.name,
          //   nameOfAttr,
          //   jAttr.value,
          //   "updatedVal:",
          //   updatedVal
          // );
          if (nameOfAttr.toLowerCase() == "innerhtml") {
            if (el.innerHTML !== updatedVal) {
              el.innerHTML = updatedVal;
            }
          } else {
            if (el[nameOfAttr] !== updatedVal) el[nameOfAttr] = updatedVal;
          }
        }
      });
    }
    getAllChildrenComponents() {
      if (!this.root) return [];
      return Array.from(this.root.querySelectorAll("*")).filter((k) => {
        return (
          k instanceof JURL.Component
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

      // console.log(parsedAttrKeys, prevParsedAttrKeys);

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
      if (!JURL.instance.log) JURL.instance.log = [];
      JURL.instance.log.push({
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

      if (JURL.instance.saveLog) this.saveLog(attrs);

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

    replaceCurlyBracketsWithContent() {
      // console.log("#### replace curly brackets");
      if (!this.root) return;

      // if (this  instanceof JURL.ForTag ) {
      //   // console.log("# do not change content of {{}} for forTAgs");
      //   return;
      // }

      let elementsWithNoChildrenAndCurlyBracketsContent = Array.from(
        this.root.querySelectorAll(":host *:not(style)")
      ).filter(
        (el) => el.childElementCount == 0 && el.innerText.indexOf("{{") > -1
      );
      if (elementsWithNoChildrenAndCurlyBracketsContent.length == 0) return;
      for (let el of elementsWithNoChildrenAndCurlyBracketsContent) {
        if (el.parentNode instanceof JURL.ForTag) return;

        let whereAreTheCurlyBrStarting = el.innerText.indexOf("{{");
        let whereAreTheCurlyBrEnding = el.innerText.indexOf("}}");
        let varInsideCurlyBr = el.innerText.substr(
          whereAreTheCurlyBrStarting + 2,
          whereAreTheCurlyBrEnding - whereAreTheCurlyBrStarting - 2
        );
        let value = this.state[varInsideCurlyBr.toLowerCase()];

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
      JURL.instance.instanciatedComponents.push(this);
      setTimeout(() => {
        this.updateParsedAttributes();
        // this.replaceCurlyBracketsWithContent();
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
      // console.log(this.constructor.name, this.uid, "died", this);

      this.observer.disconnect();
      JURL.instance.instanciatedComponents =
        JURL.instance.instanciatedComponents.filter(
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

    isEnabled() {
      return this.getState("enabled");
    }

    static create(attrs) {
      // console.log(this.name);
      let elem = JURL.instance.createComponent(
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
  },
};
