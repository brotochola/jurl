window.JURL = {
  ...(window.JURL || {}),
  RouterComponent: class RouterComponent extends JURL.Component {
    constructor() {
      super();

      this.selectADivAndMakeItVisible();

      window.onpopstate = () => this.selectADivAndMakeItVisible();

      this.getAllChildrenComponents().forEach((k) => {
        k.setState("routerdata", "{{routerdata}}");
      }); //pass the router data
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
      let tempSelectedElement = this.$(
        "*[route='" + window.location.pathname + "']"
      );

      if (this.selectedElement == tempSelectedElement) return;

      this.selectedElement = tempSelectedElement;
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
      if (this.selectedElement instanceof JURL.Component) {
        this.selectedElement.enable();
      }
    }

    navigate = (pathname, data) => {
      this.setState("routerdata", data);

      window.history.pushState({}, pathname, window.location.origin + pathname);
      this.selectADivAndMakeItVisible();
    };
  },
};
