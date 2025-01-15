import Component from "../lib/component.js";
import { duplicate } from "../lib/utils.js";
import App from "../lib/app.js";
export default class ForTag extends Component {
  static tagName = "j-for";

  constructor() {
    super(true);
    this.root = this.shadowRoot;
  }

  onInit() {
    if (!this.originalContent) {
      this.originalContent = duplicate(this.innerHTML);
    }

    this.copyStylesFromParent();
    this.executeForFunctionality();

    this.innerHTML = "";
  }
  copyStylesFromParent() {
    let parent = this.getParentComponent();
    let style, cloned;

    if (parent) {
      let doIHaveThisStyleAlready = this.$(
        "style[belongs-to-parent='" + parent.uid + "'"
      );
      if (doIHaveThisStyleAlready) {
        return;
      }
      style = parent.$("style");

      if (style && (style.innerHTML || "").length > 3) {
        cloned = style.cloneNode(true);
        cloned.setAttribute("belongs-to-parent", parent.uid);
        cloned.removeAttribute("original-style");
        this.shadowRoot.appendChild(cloned);
      }
    }
  }
  onChange(e) {
    if (e.arr) this.executeForFunctionality();
  }

  executeForFunctionality() {
    let arr = this.getState("arr");
    if (!Array.isArray(arr)) return;
    let currentChildren = this.getAllElements();
    if (arr.length == currentChildren.length) {
      //THERE'S THE SAME NUMBER OF ELEMENTS RIGHT NOW, AS THE NUMBER OF ELEMENTS THAT SHOULD BE
      this.update();
    } else if (arr.length < currentChildren.length) {
      //REMOVING ELEMENTS
      let childrenToRemove = currentChildren.splice(
        arr.length,
        currentChildren.length
      );

      childrenToRemove.forEach((k) => this.root.removeChild(k));
      this.update();
    } else if (arr.length > currentChildren.length) {
      
      //ADDING ELEMENTS
      if (!this.originalContent) return;

      let numberOfChildrenToAdd = arr.length - currentChildren.length;
      for (let i = 0; i < numberOfChildrenToAdd; i++) {
        let elem = App.instance.createComponent(this.originalContent);
        //SETS THE I ATTRIBUTE
        elem.setAttribute("i", currentChildren.length + i);
        //ADD THE ITEM AS AN ATTRIBUTE
        elem.setAttribute("item", "{{this.state.arr[i]}}");
        this.root.appendChild(elem);
      }
      this.update();
    } else if (arr.length == 0) {
      //REMOVE ALL IF ARR.LENGTH==0
      this.root.innerHTML = "";
    }
  }
}

window.JURL={...window.JURL, ForTag}