import { evalInComponent } from "./utils.js";
import {App} from "./app.js";
export default class JIf extends HTMLElement {
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

    // if (this.onDestroy instanceof Function) this.onDestroy();
  }

  connectedCallback() {
    // console.log("connected callback", performance.now());
    App.instance.instanciatedComponents.add(this);
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


window.JURL={...window.JURL, JIf}