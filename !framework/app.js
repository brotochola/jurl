class App {
  constructor(root) {
    this.root = root;
    this.components = {};
    this.instanciatedComponents = [];
  }

  searchAppTags(elem) {
    let keys = Object.keys(this.components);
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];

      let nestedComponents = elem.querySelectorAll("app-" + k);
      if (nestedComponents.length > 0) {
        nestedComponents.forEach((comp) => {
          let htmlParams = {};
          for (let i = 0; i < comp.attributes.length; i++) {
            htmlParams[comp.attributes[i].name] = comp.attributes[i].value;
          }

          let instance = eval(
            "new " +
              capitalizeFirstLetter(comp.tagName.split("-")[1].toLowerCase()) +
              "(htmlParams)"
          );

          let parent = comp.parentNode;
          parent.removeChild(comp);

          parent.appendChild(instance.elem);
          // console.log(instance.elem);
        });
      }
    }

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

    return elem;
  }

  async load(html) {
    let req = await fetch(html + "?fd=" + Math.random() * 99999);
    let content = await req.text();
    // debugger
    let elem = document.createElement("html");

    // content.indexOf("<app")

    elem.innerHTML = content;
    elem = this.searchAppTags(elem);
    let nameOfHTML = (html.split(".") || [])[0];

    let scripts = elem.querySelectorAll(nameOfHTML + " script");
    scripts.forEach((script) => {
      let newScript = document.createElement("script");
      newScript.innerHTML = script.innerHTML;
      if (script.src) newScript.src = script.src;
      newScript.setAttribute("belongs_to", nameOfHTML);

      newScript.classList.add("script_" + nameOfHTML);
      document.head.appendChild(newScript);
    });

    // //saco el script de adentro del html traido, porq no se ejecuta igualmente
    elem.querySelectorAll(" script").forEach((k) => k.remove());

    let styles = elem.querySelectorAll(nameOfHTML + " style");
    styles.forEach((st) => {
      let newStyle = st.cloneNode(true);

      newStyle.setAttribute("belongs_to", nameOfHTML);
      document.head.appendChild(newStyle);
    });

    elem.querySelectorAll(" style").forEach((k) => k.remove());

    this.components[nameOfHTML] = elem.querySelector("body *");

    // app.elementoRaiz.innerHTML += content;

    // document.querySelector(nameOfHTML).style.display = "none";
    // document.querySelector(nameOfHTML).classList.add("seccion");

    // setTimeout(() => {
    //   console.log("#### ejecutando " + nameOfHTML + ".init()");
    //   app.secciones[nameOfHTML] = window[nameOfHTML];
    //   app.secciones[nameOfHTML].init();
    //   // console.log(nameOfHTML, window[nameOfHTML])
    // }, 500);

    return 1;
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
