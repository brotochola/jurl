import Component from "../lib/component.js";
import { removeLastCharacter } from "../lib/utils.js";
import App from "../lib/app.js";
export default class RouterComponent extends Component {
  constructor() {
    super();

    this.selectADivAndMakeItVisible();

    this.putRouterDataInAllChildren();

    window.onpopstate = () => this.selectADivAndMakeItVisible();
    App.instance.navigate = (path, data) => this.navigate(path, data);
    App.instance.router = this;
  }

  putRouterDataInAllChildren() {
    this.root.querySelectorAll("*:not(style)").forEach((k) => {
      k.setAttribute("router_data", "{{state.routerData}}");
    }); //pass the router data
  }

  hideAllElementsExceptForTheSelectedElement() {
    // this.$(":host > *:not(style) > *").map(k => k.style.display = "none")

    this.$(
      ":host > *:not(style) > *:not([route='" + window.location.pathname + "'])"
    ).map((k) => {
      try {
        k.disable();
      } catch (e) {}
    });
  }
  getSelectedElement() {
    const doesItHaveSlashAtTheEnd = window.location.pathname.endsWith("/");
    let el;
    if (doesItHaveSlashAtTheEnd) {
      const pathnameWithNoSlash = removeLastCharacter(window.location.pathname);
      el = this.$("*[route='" + window.location.pathname + "']");
      if (!el) {
        el = this.$("*route='" + pathnameWithNoSlash + "']");
      }
    } else {
      el = this.$("*[route='" + window.location.pathname + "']");

      if (!el) {
        el = this.$("*[route='" + window.location.pathname + "/']");
      }
    }
    if (!el) {
      console.warn(
        "There's no component to be shown with this route, redirecting to '/'"
      );
      el = this.$("*[route='/']");
    }
    return el;
  }

  selectADivAndMakeItVisible() {
    let tempSelectedElement = this.getSelectedElement();

    if (this.selectedElement == tempSelectedElement) return;

    this.selectedElement = tempSelectedElement;

    // console.log("##### ", window.location.pathname, this.selectedElement)
    this.hideAllElementsExceptForTheSelectedElement();

    // this.root
    //   .querySelectorAll(
    //     ":host *:not([route='" + window.location.pathname + "'])"
    //   )
    //   .forEach((el) => {
    //     if (el instanceof JURL.Component) el.disable();
    //   });

    if (this.selectedElement instanceof Component) {
      this.selectedElement.enable();
    }
  }

  navigate(pathname, data) {
    // console.log("navigate", pathname, data);
    this.setState("routerData", data);
    window.history.pushState({}, pathname, window.location.origin + pathname);
    this.selectADivAndMakeItVisible();
  }
}
