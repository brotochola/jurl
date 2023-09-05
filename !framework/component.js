class Component {
  constructor(params) {
    this.uid = Math.floor(Math.random() * 999999999);
    this.elem =
      app.components[this.constructor.name.toLowerCase()].cloneNode(true);

    this.elem.instanceReference = this;

    this.elem.setAttribute("uid", this.uid);

    if (!!params) {
      let keys = Object.keys(params);
      for (let i = 0; i < keys.length; i++) {
        this.elem.setAttribute(keys[i], params[keys[i]]);
      }
    }

    app.instanciatedComponents.push(this);

    this.params = params;
  }

  getElementInDOM() {
    let elem = app.root.querySelector("*[uid='" + this.uid + "']");
    elem.instanceReference = this;
    return elem;
  }

  insert(where) {
    where.appendChild(this.elem);
  }
}
