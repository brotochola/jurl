class App {
  constructor(root) {
    this.root = root;
    this.cutAppsContentWhileItLoads();
    this.components = {};
    this.instanciatedComponents = [];
  }

  cutAppsContentWhileItLoads() {
    this.content = this.root.innerHTML;
    this.root.innerHTML = "";
  }

  // searchAppTags(elem) {
  //   let keys = Object.keys(this.components);
  //   for (let i = 0; i < keys.length; i++) {
  //     let k = keys[i];

  //     let nestedComponents = elem.querySelectorAll("app-" + k);
  //     if (nestedComponents.length > 0) {
  //       nestedComponents.forEach((comp) => {
  //         let htmlParams = {};
  //         for (let i = 0; i < comp.attributes.length; i++) {
  //           htmlParams[comp.attributes[i].name] = comp.attributes[i].value;
  //         }

  //         let instance = eval(
  //           "new " +
  //             capitalizeFirstLetter(comp.tagName.split("-")[1].toLowerCase()) +
  //             "(htmlParams)"
  //         );

  //         let parent = comp.parentNode;
  //         parent.removeChild(comp);

  //         parent.appendChild(instance.elem);
  //         // console.log(instance.elem);
  //       });
  //     }
  //   }

  // let charNum = txt.indexOf("<app");
  // if (charNum > -1) {
  //   let t = txt.substr(charNum, 9999999999999999);

  //   //NOW I SERCH THE ENDING

  //   let endingCharNum = t.indexOf(">");
  //   if (endingCharNum > -1) {
  //     let rest = t.substr(endingCharNum + 1, 9999999999999999);

  //     let endOfTag = rest.indexOf(">");
  //     if (endOfTag > -1) {
  //       let ending = rest.substr(0, endOfTag + 1);

  //       let completeTag = t.substr(0, endingCharNum + endOfTag + 2);
  //       // console.log("comlpeteTAg", completeTag, txt.indexOf(completeTag));

  //       let componentName = completeTag.split("<app-")[1].split(" ")[0];
  //       let compo = app.components[componentName];

  //       // console.log(compo.outerHTML);
  //       let instanceOfCompo = eval(
  //         "new " + capitalizeFirstLetter(componentName) + "()"
  //       );
  //       // return txt.replace(completeTag, instanceOfCompo.elem.outerHTML);
  //     }
  //   }
  // }
  // return txt;

  //   return elem;
  // }

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
    return new DOMParser().parseFromString(txt, "text/html").body.children[0];
  }

  async loadManyComponents(arr) {
    let arrOfPromises = [];
    for (let co of arr) {
      arrOfPromises.push(this.loadComponent(co));
    }
    await Promise.all(arrOfPromises);
    return 1;
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
      app.throwError(e);
    }
  }

  throwError(e) {
    console.error(e);
  }

  async loadComponent(html) {
    let req = await fetch(html + "?fd=" + Math.random() * 99999);
    let content = await req.text();
    let elem = document.createElement("html");
    elem.innerHTML = content;

    // let nameOfHTML = (html.split(".") || [])[0];

    let nameOfHTML = this.getComponentsNameFromJSClass(elem);

    this.getAndLoadScripts(nameOfHTML, elem);

    //DEAL WITH STYLES:

    let style = (
      elem.querySelector("head style") || document.createElement("style")
    ).cloneNode(true);

    this.components[nameOfHTML] = {
      html: elem.querySelector("body").innerHTML,
      css: style,
    };

    return 1;
  }

  init() {
    this.root.innerHTML = this.content;
  }

  defineComponentsName(classs, name) {
    customElements.define(
      name || convertStringToComponentFriendlyName(classs.name),
      classs
    );
  }
}
