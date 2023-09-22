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

    this.executeForFunctionality();
  }

  executeForFunctionality() {
    console.log("### execute for functionality", this.state);
    let arr = this.getState("arr");
    let item = this.getState("item");

    if (!Array.isArray(arr)) return;
    this.root.innerHTML = "";

    // let str = "";
    for (let i = 0; i < arr.length; i++) {
      //   debugger;
      //   console.log("$$$", this.originalContent, "{{" + item + "}}", arr[i]);
      let elem = app.createComponent(this.originalContent);
      elem.setAttribute("i", i);
      //   str += ;
      this.root.appendChild(elem);

      //   .replace(
      //     "{{" + item + "}}",
      //     JSON.stringify(arr[i])
      //   );
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
        let val = el.getAttribute("j-innerHTML");
        let i = el.getAttribute("i");
        // console.log(el);
        if (val.indexOf("{{") > -1 && val.indexOf("}}") > -1) {
          let newValWithNoCurly = removeCurlyBrackets(val.trim());
          //   console.log("$$$", newValWithNoCurly);
          let valueOfForProcessing = eval("this.state." + newValWithNoCurly);
          el.innerHTML = valueOfForProcessing;
        } else {
          let updatedVal = this.getState(val.trim()) || "";
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

      let valueOfForProcessing = eval("this.state." + varInsideCurlyBr);

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
