// const JURL = {};
import Component from "../lib/component.js";
import {
  cloneAttributes,
  convertStringToComponentFriendlyName,
  createTree,
} from "./utils.js";

import JFor from "./jfor.js";
import JIf from "./jif.js";
import JDebug from "./jdebug.js";

import * as utils from "./utils.js";
window.JURL = { ...window.JURL, utils };

export default class App {
  instance = null;
  static registeredCustomElements = {};
  constructor(options) {
    if (App.instance) return App.instance;
    this.log = [];
    Object.assign(this, options);

    if (!this.root) {
      console.error("the app was initialized without root");
    }

    this.registerCustomElements();

    this.cutAppsContentWhileItLoads();
    this.components = {};
    this.instanciatedComponents = new Set();
    App.instance = this;
    this.DOMparser = new DOMParser();
  }
  registerCustomElements() {
    App.defineComponentsName(JFor,"j-for");
    App.defineComponentsName(JIf,"j-if");
    App.defineComponentsName(JDebug,"j-debug");
  }
  getTreeOfComponents(simple, showState) {
    return createTree(this.root, simple, showState);
  }

  init() {
    // this.root.innerHTML = this.content;
    const mainComponentsTagName = "app-main";
    //I USE THE COMPONENT CLASS TO DEFINE AN BLANK, HOLLOW, COMPONENT, WHICH WILL BE THE MAIN COMPONENT OF THE APP
    //THE IDEA IS TO BE ABLE TO USE THE COMPONENT'S FUNCTIONALITIES IN THE MAIN APP AS WELL
    App.defineComponentsName(Component, mainComponentsTagName);
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
      newScript.type = "module";
      // console.log(script)
      //THIS LINE AUTOMATICALLY REGISTERS THE COMPONENT

      script.innerHTML +=
        " \n try{App.defineComponentsName(" +
        nameOfHTML +
        ") }catch(e){window.JURL.App.defineComponentsName(" +
        nameOfHTML +
        ") ;};";

      newScript.innerHTML = script.innerHTML;
      if (script.src) newScript.src = script.src;
      newScript.setAttribute("belongs_to", nameOfHTML);
      newScript.classList.add("script_" + nameOfHTML);

      document.head.appendChild(newScript);
    });
    elem.querySelectorAll("script").forEach((k) => k.remove());
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


  getComponentFromURL(url) {
    let arr = Object.keys(this.components)
      .map((key) => {
        return this.components[key];
      })
      .filter((c) => c.path == url);

    if (arr.length > 0) return arr[0];
  }

  async loadComponent(html) {
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
    let content = await req.text();
    let elem = document.createElement("html");
    elem.innerHTML = content;

    // let nameOfHTML = (html.split(".") || [])[0];

    let nameOfHTML = utils.getComponentsNameFromJSClass(elem);

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

    // this.checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded(nameOfHTML);
    // await utils.wait(1)
    return App.waitUntilComponentIsActuallyRegistered(convertStringToComponentFriendlyName(nameOfHTML))
    // return 1;
  }
  // checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded(name) {
  //   console.log("#checkIfTheresAnyComponentsToBeInitiallizedAfterLoaded", name);

  //   // let classNameOfNewCompo = eval(name);
  //   // let arr = this.instanciatedComponents.filter(
  //   //   (k) => k instanceof classNameOfNewCompo
  //   // );
  //   // if (arr.length > 0) {
  //   //   arr[0].outerHTML += " ";
  //   // }

  //   this.instanciatedComponents.forEach((k) => {
  //     if (
  //       k.tagName.toLowerCase() == convertStringToComponentFriendlyName(name)
  //     ) {
  //       k.outerHTML += " ";
  //     }
  //   });
  // }

  static defineComponentsName(classs, name) {
    const newName =
      name ||
      classs.tagName ||
      convertStringToComponentFriendlyName(classs.name);

    console.log("defineComponentsName", classs.name, newName);

    if (
      App.registeredCustomElements[newName] ||
      Object.values(App.registeredCustomElements).includes(classs)
    ) {
      return console.warn("the component " + newName + " was already defined");
    }

    customElements.define(newName, classs);

    App.registeredCustomElements[newName] = classs;
  }

  static async waitUntilComponentIsActuallyRegistered(tagName) {
    if (App.registeredCustomElements[tagName]) return true;
    const max = 200;
    const msDif = 10;
    let count = 0;

    return new Promise((resolve) => {
      const check = () => {
        // console.log("### check", tagName,count, max, performance.now());
        if (App.registeredCustomElements[tagName]) {
          // console.log("## ",tagName,"ready")
          resolve(true); // Resolves the promise when the condition is met
        } else {
          count += msDif;
          if (count > max) {
            resolve(false);
          } else {
            setTimeout(check, msDif); // Check again after 1 ms
          }
        }
      };

      check();
    });
  }
}

window.JURL = { ...window.JURL, App };
