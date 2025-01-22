import Component from "./component.js";
import { duplicate } from "./utils.js";
import { App } from "./app.js";

export class JContextWriter extends Component {
  static instances = new Set();

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
    
    this.root = this.shadowRoot;
    window.jw = this;
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
    this.root=this.shadowRoot
  }

  onInit() {
    console.trace("init reader");
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

  onChange(changes) {
    console.log("reader changes", changes);

    if (!changes) return;
    if (changes.contextName) {
      this.contextName = changes.contextName.current;
    }
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
