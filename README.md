# jurl / NoBSjs

/dʒɜrl/

A Javascript UI framework based on web components (custom elements)

- No re-renders: no DOM parsing, no building of templates with strings. We use real html elements.
- The HTML is the state. We use attributes of html elements, so you can see on the inspector exactly what is happening.
- No compile, no transpile, no build, no node, no package.json, no dependencies.
- Less than 20kb
- We take the best of react, the best of Angular and the best of Vue, and we take out all the complex stuff.
- Super Fast.
- Reusable components
- Scoped styles

---

- APP:

  - This is how you intanciate the app: `const app=new App(elementToBeReplaced)`
  - Load components: `app.loadComponent("folder/file.html")`

- COMPONENTS:

  - A normal html file with a `<style>` tag, a single html element (div, span or same as the class), and a script. The script part is a js class that extends JURL.Component (which Extends html element)
  - List of Component's methods:
    - `getAllChildrenComponents()` returns an array of all the components inside of this
    - `$(selector)` returns one or more elements inside of the component
    - `getParentComponent()` returns the component above in the DOM tree (not the element, the component)
    - `enable()` makes the component visible and selectable
    - `disable()` makes the component invisible and puts its children inside of a template, so they keep their state, but don't render on the DOM
    - `isEnabled()` returns a boolean
    - `setState(name, value)` sets a state variable, which actually ends up being an attribute of the component. They can have values between curly brackets like `{{variable}}` to be linked to the parent's state
    - `getState(name)`
    - `setCSSVariable(name,value)`
    - `getCSSVariable(name)`
    - `onChange(changes)`
    - `onInit()`
    - `onDestroy()`

- Events:

  - j-onclick="nameOfMethod"
  - j-onchange="handleChange
  - j-on...

- State and Props
  I treat states and props the same, they are attributes of the html element
  A component with an attribute set with double curly bracks will take the value from the parent (since the component is instanciated in the parent).

  `<my-component username={{state.user.data.username}} />`

  This example creates a "my-component" type of component, which was loaded from a single html file, with the attribute/prop/state of username set to "parent.state.user.data.username". And this is reactive: each time the parent component changes its "state.user" it will trigger an update on the child "my-component". When "my-component" updates it will check the value of parent.user.data.username and the current value it has, and get the new value. And 'rerender'. We don't really use rerender, but it will check where that state is used and update the DOM elements. Only those elements that gotta be updated.

- Data-binding
  {{nameOfState}} takes the value from the component.
  examples:
  `<p j-innerhtml="{{person.name}}"></p>`
  `<img j-src="{{person.image}}">`

- Components' lifecycle:

  - contructor
  - onInit
  - onChange
  - onEnabled
  - onDisabled
  - onDestroy

- Magic stuff:
  - `<j-if condition="{{shouldShow()}}"> <p>hi</p></j-if>`
    - Conditional Tag, like ngIf but syntactically like coding
    - I think it's very clear to have a tag wrapping the element that will be shown or not. Like: `if(condition){ doSomething();}`
    - It updates automatically when the state of the component changes
    - It doesn't inherite from the Component class.
  - `<j-for arr={{someArray}}> <p j-innerhtml={{arr[i]}}></p>  </j-for>`
    - For Tag, like ngFor.
    - Note that the element inside of the `<j-for>` uses `arr[i]` to make reference to the value of the index of the array
    - It inherits from the Component class
  - Router class:
    - a RouterComponent class that you can extend and make your own. This is a components that automatically shows and hides its children according to the pathname
    - This is how we can link components/pages with the pathname in the url:
    - `<app-page2 route="/page2"> </app-page2>`
    - `<app-page3 route="/page3"> </app-page3>`
  - j-classname:
    - whatever expresion in the component scope that returns a string
    - `<app-my-component j-classname="{{this.getClassNames()}}" />`
  - j-style:
    - some expresion that returns an object, this goes in js format (camelCase), not css format:
    - `<app-my-component j-style="{{{color:'red',fontSize: this.getFontSize()}}}" />`
  - j-some-attribute:
    - `<p j-inner-text="{{'hey'}}">` will result in setting the `innerText` property of the p element.
    - snake-case is converted to camelCase, so inner-h-t-m-l will result in innerHTML and class-name results in className
    - It's a way of passing variables from the markup to whatever property of the element

---

- TODO:
- benchmarks with lighthouse
- findMatchingProperty para pasar de attributos a propiedades
- key a los j-for, como en react

- CONTEXT:
  - `<context-writer context-name="user" some-var="{{3.14159+1}}"/>`
  - `<context-reader context-name="user" some-var="4.14159" > <app-some-component /> </context-reader>`
  - when some state of the writer changes, it searches the readers linked to it, by the context-name, and updates the readers' state, triggering the update of the children components.
  -All writers and readers
  - JURL.Context class: 
    - has a Set of instances
    - has a Set of Proxys
    - Context.setValue(contextName, key, value)
      - sets the state of the context-reader component, that will trigger the update in its children      
    - connectedCallback: add to set of instances







---------------------------------

- COSITAS PA LEER Y AGREGAR A LA DOC DE ESTA LIBRERIA:

  - https://www.npmjs.com/package/morphdom/v/1.1.3

- MUESTRAS DE LIBRERIAS Y FRAMEWORK DE FRONTEND QUE INVENTAN UNA SINTAXIS LOCA:

  - https://purescript-halogen.github.io/purescript-halogen/guide/

- NOSOTROS HACEMOS LO MISMO PERO MAS SIMPLE: 'trully reactive':
- https://www.youtube.com/watch?v=hw3Bx5vxKl0&t=42s&ab_channel=Fireship
