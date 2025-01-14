//COMPONENT USED TO SHOW DEBUG JSONS
import Component from "../lib/component.js";
import { evalInComponent } from "../lib/utils.js";
export default class DebugTag extends Component {
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
