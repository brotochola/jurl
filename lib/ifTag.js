class IfTag extends HTMLElement {
  static get observedAttributes() {
    return ["condition"];
  }

  constructor() {
    super();

    window.ifCompo = this;

    // console.log("construcotr", performance.now());
  }
  connectedCallback() {
    // console.log("connected callback", performance.now());

    this.savedOuterHTML = this.outerHTML;

    this.update();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.update();
  }

  update() {
    // console.trace("evaluate condition");
    let parentComponent = this.getParentComponent();
    // console.log("update", performance.now(), parentComponent);
    let condition = this.getAttribute("condition");
    if (condition.length > 1 && parentComponent) {
      let attr = condition.trim();
      let starting = attr.indexOf("{{");
      let ending = attr.indexOf("}}");
      if (starting > -1 && ending > -1) {
        let trimmedString = attr.substr(starting + 2, ending - 2);

        let removePrethesisFromString = trimmedString.split("()")[0];

        let functionToExecute =
          parentComponent[removePrethesisFromString].bind(parentComponent);

        if (functionToExecute instanceof Function) {
          let resultOfConditionFunction = functionToExecute();
          setTimeout(
            () => this.handleConditionChanged(resultOfConditionFunction),
            1
          );
        } else {
          debugger;
        }
      }
    }
  }

  handleConditionChanged(conditionValue) {
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

customElements.define("j-if", IfTag);
