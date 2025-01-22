import Component from "./component.js";
import { duplicate } from "./utils.js";
import { App } from "./app.js";

export class JContextWriter extends Component {
  static instances = new Set();
  static contexts = {};

  getAllInstancesOfReadersWithMyContextName() {
    // let arrOfWriters = Array.from(this.constructor.instances).filter(
    //   (k) => k.contextName == this.contextName
    // );
    let arrOfReaders = Array.from(
      this.constructor.JContextReader.instances
    ).filter((k) => k.contextName == this.contextName);
    return arrOfReaders;
  }

  constructor() {
    super(true);

    // this.root = this.shadowRoot;
    this.getContextName();
    window.jw = this;
  }

  getContextName() {
    this.contextName = this.getAttribute("context-name");
    if (!this.contextName) {
      console.warn(
        "This context reader component doesn't have a context-name attribute"
      );
    }
  }

  onInit() {
    // console.trace("init writer");

    JContextWriter.instances.add(this);
  }

  onChange(changes) {
    if (!changes) return;
    if (changes.contextName) {
      this.contextName = changes.contextName.current;
    }
    console.log("writer changes", changes);
    this.triggerUpdateInTheReaders(changes);
    this.saveNewValuesInContexts(changes);
  }
  saveNewValuesInContexts(changes) {
    const keys = Object.keys(changes);
    for (let key of keys) {
      const current = changes[key].current;
      if (!JContextWriter.contexts[this.contextName]) {
        JContextWriter.contexts[this.contextName] = {};
      }
      JContextWriter.contexts[this.contextName][key] = current;
    }
  }

  triggerUpdateInTheReaders(changes) {
    const keys = Object.keys(changes);
    for (let key of keys) {
      const current = changes[key].current;
      this.getAllInstancesOfReadersWithMyContextName().forEach((element) => {
        element.setState(key, current);
      });
    }
  }
  onDestroy() {
    JContextWriter.instances.delete(this);
  }
}

/*
-----------------------------------------------------
*/

export class JContextReader extends Component {
  static instances = new Set();

  constructor() {
    super(true);
    window.jc = this;
    this.getContextName();

    // this.root=this.shadowRoot
  }
  getContextName() {
    this.contextName = this.getAttribute("context-name");
    if (!this.contextName) {
      console.warn(
        "This context reader component doesn't have a context-name attribute"
      );
    }
  }

  onInit() {
    JContextReader.instances.add(this);
    if (!this.originalContent) {
      this.originalContent = duplicate(this.innerHTML);
      this.shadowRoot.innerHTML += this.innerHTML;
      this.innerHTML = "";
    }

    this.copyStylesFromParent();
  }

  copyStatesFromParent() {
    const parent = this.getParentComponent();
    
    const states = Object.keys(parent.state);
    for (let state of states) {
      if (state == "uid" || state == "enabled") continue;
      this.setState(state, parent.getState(state));
    }
  }
  passStateToChildrenComponents() {
    const states = Object.keys(this.state);
    const children = this.getAllChildrenComponents();
    console.log(states, children);

    for (let state of states) {
      if (state == "uid" || state == "enabled") continue;

      children.forEach((compo) => {
        compo.setState(state, this.getState(state));
      });
    }
  }

  onChange(changes) {
    console.log("reader changes", changes);

    if (!changes) return;
    if (changes.contextName) {
      this.contextName = changes.contextName.current;
    }
    this.passStateToChildrenComponents();
    this.copyStatesFromParent();
  }
  onDestroy() {
    JContextReader.instances.delete(this);
  }

  getAllInstancesOfReadersAndWritersWithMyContextName() {
    let arrOfWriters = Array.from(this.constructor.instances).filter(
      (k) => k.contextName == this.contextName
    );
    let arrOfReaders = Array.from(
      this.constructor.JContextWriter.instances
    ).filter((k) => k.contextName == this.contextName);
    return [...arrOfReaders, ...arrOfWriters];
  }
}

JContextReader.JContextWriter = JContextWriter;
JContextWriter.JContextReader = JContextReader;

window.JURL = { ...window.JURL, JContextReader, JContextWriter };
