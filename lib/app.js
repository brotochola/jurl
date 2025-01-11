window.JURL = {
  ...(window.JURL || {}),
  App: class App {
    constructor(options) {
      if (JURL.instance) return JURL.instance;
      this.log = [];
      Object.assign(this, options);

      if (!this.root) {
        this.throwError("the app was initialized without root");
      }

      this.cutAppsContentWhileItLoads();
      this.components = {};
      this.instanciatedComponents = [];
      JURL.instance = this;
      this.DOMparser = new DOMParser();
    }
    getTreeOfComponents(simple, showState) {
      return createTree(this.root, simple, showState);
    }

    getFlattenedHTML() {
      return sanitizeHtmlString(this.root.root.getInnerHTML());
    }

    init() {
      // this.root.innerHTML = this.content;
      const mainComponentsTagName = "app-main";
      //I USE THE COMPONENT CLASS TO DEFINE A BLANK, HOLLOW, COMPONENT, WHICH WILL BE THE MAIN COMPONENT OF THE APP
      //THE IDEA IS TO BE ABLE TO USE THE COMPONENT'S FUNCTIONALITIES IN THE MAIN APP AS WELL
      this.defineComponentsName(JURL.Component, mainComponentsTagName);
      //CREATE THE COMPONENT
      this.mainComponent = this.createComponent(
        "<" + mainComponentsTagName + "></" + mainComponentsTagName + ">"
      );
      //APPEND IT SO IT TRIGGERS THE CONNECTEDCALLBACK
      this.root.appendChild(this.mainComponent);

      //COPY ATTRIBUTES
      cloneAttributes(this.mainComponent, this.root);

      //REPLACE THE ROOT
      this.root.replaceWith(this.mainComponent);
      //ONLY NOW, AS LAST, INSERT THE HTML CODE, SO THE COMPONENTS ONLY GET INSTANCED ONCE
      this.mainComponent.shadowRoot.innerHTML =
        "<span>" + this.content + "</span>";
      //I NEED TO SET BY HAND, BECAUSE WHEN THE MAIN COMPONENT GETS INSTANCIATED IT DOESN'T HAVE ANY CONTENT
      this.mainComponent.setRoot(this.mainComponent.shadowRoot.children[0]);
      this.root = this.mainComponent;
    }

    cutAppsContentWhileItLoads() {
      this.content = this.root.innerHTML;

      this.root.innerHTML = "";
    }

    getAndLoadScripts(nameOfHTML, elem) {
      let scripts = elem.querySelectorAll(" script");
      scripts.forEach((script) => {
        let newScript = document.createElement("script");
        newScript.innerHTML = script.innerHTML;
        if (script.src) newScript.src = script.src;
        newScript.setAttribute("belongs_to", nameOfHTML);
        newScript.classList.add("script_" + nameOfHTML);
        document.head.appendChild(newScript);
      });
      elem.querySelectorAll(" script").forEach((k) => k.remove());
    }

    createComponent(txt) {
      return this.DOMparser.parseFromString(txt, "text/html").body.children[0];
    }

    async loadManyComponents(arr) {
      let arrOfPromises = [];
      for (let co of arr) {
        arrOfPromises.push(this.loadComponent(co));
      }
      try {
        await Promise.all(arrOfPromises);
        return 1;
      } catch (e) {
        console.warn(e);
        return 0;
      }
    }
    getComponentsNameFromJSClass(elem) {
      try {
        let scriptString = elem.querySelector("script").innerHTML.trim();
        let classString = "class ";
        let numOfCharWhereClass = scriptString.indexOf(classString);
        let cutString = scriptString.substring(
          numOfCharWhereClass + classString.length,
          scriptString.length
        );

        let className = cutString.split(" extends ")[0];
        return className;
      } catch (e) {
        this.throwError(e);
      }
    }

    throwError(e) {
      console.error(e);
    }

    getComponentFromURL(url) {
      let arr = Object.keys(this.components)
        .map((key) => {
          return this.components[key];
        })
        .filter((c) => c.path == url);

      if (arr.length > 0) return arr[0];
    }

    async loadComponent(html) {
      console.log("#loading component ", html)
      if (this.getComponentFromURL(html)) {
        return 1;
      }

      let req;
      try {
        req = await fetch(html + "?fd=" + Math.random() * 99999);
      } catch (e) {
        console.warn(e);
        return 0;
      }
      //get the response as text
      let content = await req.text();
      //create a new html element
      let elem = document.createElement("html");
      //set the text content in the new html element, so its parsed as html
      elem.innerHTML = content;
     

      let nameOfHTML = this.getComponentsNameFromJSClass(elem);

      if (this.components[nameOfHTML]) {
        console.warn("the component " + nameOfHTML + " was already loaded");
        return 1;
      }

      this.getAndLoadScripts(nameOfHTML, elem);

      //DEAL WITH STYLES:

      let style = (
        elem.querySelector("head style") || document.createElement("style")
      ).cloneNode(true);

      this.components[nameOfHTML] = {
        html: elem.querySelector("body").innerHTML,
        css: style,
        path: html,
      };

      this.checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded(nameOfHTML);
      return 1;
    }
    checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded(name) {
      
      let classNameOfNewCompo = eval(name);
      let arr = this.instanciatedComponents.filter(
        (k) => k instanceof classNameOfNewCompo
      );
      if (arr.length > 0) {
        // by changing the outerhtml (or innerhtml) it gets reparsed
        arr[0].outerHTML += " ";
      }
    }

    defineComponentsName(classs, name) {
      customElements.define(
        name || convertStringToComponentFriendlyName(classs.name),
        classs
      );
    }
  },
};
