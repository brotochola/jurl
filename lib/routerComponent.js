class RouterComponent extends Component {
  constructor() {
    super();

    this.selectADivAndMakeItVisible();

    window.onpopstate = () => this.selectADivAndMakeItVisible();

    // app.navigate = this.navigate;
    // this.navigate("/jurl/rick")
  }

  hideAllElements() {
    // this.$(":host > *:not(style) > *").map(k => k.style.display = "none")
    this.$(":host > *:not(style) > *").map((k) => {
      try {
        k.disable();
      } catch (e) {}
    });
  }

  selectADivAndMakeItVisible() {
    this.selectedElement = this.$(
      "*[route='" + window.location.pathname + "']"
    );
    if (!this.selectedElement && window.location.pathname.endsWith("/")) {
      this.selectedElement = this.$(
        "*[route='" +
          window.location.pathname.substr(
            0,
            window.location.pathname.length - 1
          ) +
          "']"
      );
    } else if (
      !this.selectedElement &&
      !window.location.pathname.endsWith("/")
    ) {
      this.selectedElement = this.$(
        "*[route='" + window.location.pathname + "/"
      );
    }

    // console.log("##### ", window.location.pathname, this.selectedElement)
    this.hideAllElements();
    if (this.selectedElement instanceof Component)
      this.selectedElement.enable();
  }

  navigate = (pathname) => {
    window.history.pushState({}, pathname, window.location.origin + pathname);
    this.selectADivAndMakeItVisible();
  };
}
