//COMPONENT USED TO SHOW DEBUG JSONS

window.JURL = {
  ...(window.JURL || {}),
  DebugTag: class DebugTag extends JURL.Component {
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
  },
};
customElements.define("j-debug", JURL.DebugTag);
