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

      let splitted = attr.split("()");

      let removePrethesisFromString = splitted[0];

      if (splitted.length == 1) {
        //IF IT'S NOT A FUNCTION
        //GET PARENT'S STATE VALUE
        let stateInParent = parentComponent.getState(removePrethesisFromString);
        //TRIGGER UPDATE
        setTimeout(() => this.handleConditionChanged(stateInParent), 1);
      } else {
        //IF IT IS A FUNCTION
        //GET FUNCTIONS NAME
        let functionToExecute = parentComponent[removePrethesisFromString];

        if (functionToExecute instanceof Function) {
          //EXECUTE AND GET RESULT
          //I HAVE TO BIND THE COMPONENT TO KEEP THE THIS FUNCTIONALITY IN THE METHOD
          let resultOfConditionFunction =
            functionToExecute.bind(parentComponent)();
          //TRIGGER UPDATE
          setTimeout(
            () => this.handleConditionChanged(resultOfConditionFunction),
            1
          );
        } else {
          debugger;
        }
      }

      // }
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

customElements.define("j-if", IfTag);
