import {evalInComponent } from "../lib/utils.js";
export default class IfTag extends HTMLElement {
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
