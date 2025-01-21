//COMPONENT USED TO SHOW DEBUG JSONS
import Component from "./component.js";
import { evalInComponent } from "./utils.js";
export default class JDebug extends Component {
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
