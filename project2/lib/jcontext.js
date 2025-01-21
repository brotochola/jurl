import Component from "./component.js";
import { duplicate } from "./utils.js";
import { App } from "./app.js";

export class JContextWriter extends Component {
  static instances = new Set();

  getAllInstancesOfReadersAndWritersWithMyContextName() {
    let arrOfWriters = Array.from(this.constructor.instances).filter(
      (k) => k.contextName == this.contextName
    );
    let arrOfReaders = Array.from(
      this.constructor.JContextReader.instances
    ).filter((k) => k.contextName == this.contextName);
    return [...arrOfReaders, ...arrOfWriters];
  }

  constructor() {
    super(true);
    this.root = this.shadowRoot;
    window.jw = this;
  }

  onInit() {
    JContextWriter.instances.add(this);
  }

  onChange(changes) {
    if (!changes) return;
    if (changes.contextName) {
      this.contextName = changes.contextName.current;
    }

    const keys = Object.keys(changes);
    for (let key of keys) {
      const current = changes[key].current;
      this.getAllInstancesOfReadersAndWritersWithMyContextName().forEach(
        (element) => {
          element.setState(key, current);
        }
      );
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
    //   console.log(this.root)
      this.root = this.shadowRoot;

    window.jc = this;
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

  onChange(changes) {
    if (!changes) return;
    if (changes.contextName) {
      this.contextName = changes.contextName.current;
    }

    const keys = Object.keys(changes);
    for (let key of keys) {
      const current = changes[key].current;
      this.getAllInstancesOfReadersAndWritersWithMyContextName().forEach(
        (element) => {
          element.setState(key, current);
        }
      );
    }
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
