# jurl / NoBSjs

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
  A component with an attribute set with double curly bracks will take the value fromt he parent's state (since the component is instanciated in the parent).

  `<my-component username={{user.data.username}} />`

  This example creates a "my-component" type of component, which was loaded from a single html file, with the attribute/prop/state of username set to "parent.state.user.data.username". And this is reactive: each time the parent component changes its "state.user" it will trigger an update on the child "my-component". When "my-component" updates it will check the value of parent.user.data.username and the current value it has, and get the new value. And 'rerender'. We don't really use rerender, but it will check where that state is used and update the DOM elements. Only those elements that gotta be updated.

- Data-binding
  {{nameOfState}} takes the value from the state.
  examples:
  `<p j-innerhtml="{{person.name}}"></p>`
  `<img j-src="{{person.image}}">`

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

---

TO DO LIST:

- standarize use of {{}} for functions, arrays, etc
- allow `<button j-onclick="{{()=>alert(1)}}"> alert</button>`
