class ForTag extends Component {
  constructor() {
    super(true);
    this.root = this.shadowRoot;
    // // debugger;
  }

  onInit() {
    console.log("# on init for");
    // this.onChange();
    window.forT = this;

    this.originalContent = duplicate(this.innerHTML);

    // this.shadowRoot.innerHTML = this.originalContent;

    // this.innerHTML = "";
  }
  onChange(e) {
    console.log("on change for", e);
    // this.arr = this.getParentComponent().getState(this.getState("arr"));
    if (e.arr) this.executeForFunctionality();
  }

  executeForFunctionality() {
    console.log("### execute for functionality", this.state);
    let arr = this.getState("arr");
    let item = this.getState("item");

    if (!Array.isArray(arr)) return;

    let currentChildren = this.getAllElements();
    if (arr.length == currentChildren.length) {
      console.log("%%% SAME LENGTH");
      this.update();
    } else if (arr.length < currentChildren.length) {
      console.log("%%% GOTTA TAKE OUT");
      let childrenToRemove = currentChildren.splice(
        arr.length,
        currentChildren.length
      );
      console.log("childrenToRemove", childrenToRemove);
      childrenToRemove.forEach((k) => this.root.removeChild(k));
      this.update();
    } else if (arr.length > currentChildren.length) {
      console.log("%%% GOTTA ADD");
      let numberOfChildrenToAdd = arr.length - currentChildren.length;
      for (let i = 0; i < numberOfChildrenToAdd; i++) {
        let elem = app.createComponent(this.originalContent);
        elem.setAttribute("i", currentChildren.length + i);
        //   str += ;
        this.root.appendChild(elem);
      }
      this.update();
    } else if (arr.length == 0) {
      console.log("%%% GOTTA REMOVE EM ALL");
      this.root.innerHTML = "";
    }

    // this.root.innerHTML = str;

    // console.log("### innerHTML of shadow root", this.root.innerHTML);
    this.updateJInnerHTML();
    this.replaceCurlyBracketsWithContent();
  }

  updateJInnerHTML() {
    // console.log("####  UPDATE JINNER");
    if (!this.root) return;
    // UPDATES THE INNERHTML OF ALL ELEMENTS THAT HAVE THE j-innerHTML ATTRIBUTE
    this.root
      .querySelectorAll(":host *[j-innerHTML]:not(:has(> *))")
      .forEach((el) => {
        let val = el.getAttribute("j-innerHTML").trim().toLowerCase();
        let i = el.getAttribute("i");
        // console.log(el);
        if (val.indexOf("{{") > -1 && val.indexOf("}}") > -1) {
          let newValWithNoCurly = removeCurlyBrackets(val);
          //   console.log("$$$", newValWithNoCurly);
          let valueOfForProcessing;
          try {
            valueOfForProcessing = eval("this.state." + newValWithNoCurly);
          } catch (e) {}

          el.innerHTML = valueOfForProcessing;
        } else {
          let updatedVal = this.getState(val) || "";
          if (el.innerHTML != updatedVal) el.innerHTML = updatedVal;
        }

        // console.log("#updatedVal", val, val.trim(), updatedVal);

        // }
      });
  }

  replaceCurlyBracketsWithContent() {
    // console.log("#### replace curly brackets IN FOR TAG");
    if (!this.root) return;

    let elementsWithNoChildrenAndCurlyBracketsContent = Array.from(
      this.root.querySelectorAll(":host *:not(style)")
    ).filter(
      (el) => el.childElementCount == 0 && el.innerText.indexOf("{{") > -1
    );
    if (elementsWithNoChildrenAndCurlyBracketsContent.length == 0) return;
    for (let el of elementsWithNoChildrenAndCurlyBracketsContent) {
      let whereAreTheCurlyBrStarting = el.innerText.indexOf("{{");
      let whereAreTheCurlyBrEnding = el.innerText.indexOf("}}");

      if (whereAreTheCurlyBrStarting == -1 || whereAreTheCurlyBrEnding == -1) {
        return;
      }

      let varInsideCurlyBr = el.innerText.substr(
        whereAreTheCurlyBrStarting + 2,
        whereAreTheCurlyBrEnding - whereAreTheCurlyBrStarting - 2
      );

      let i = el.getAttribute("i");
      let valueOfForProcessing;
      try {
        valueOfForProcessing = eval("this.state." + varInsideCurlyBr);
      } catch (e) {
        valueOfForProcessing = undefined;
      }

      //   // console.log(
      //   //   "!!!!!!!",
      //   //   el.innerText,
      //   //   whereAreTheCurlyBrStarting,
      //   //   whereAreTheCurlyBrEnding,
      //   //   varInsideCurlyBr,
      //   //   value
      //   // );
      el.innerText = el.innerText.replace(
        "{{" + varInsideCurlyBr + "}}",
        valueOfForProcessing
      );
    }
  }
}
customElements.define("j-for", ForTag);