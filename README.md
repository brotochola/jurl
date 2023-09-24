# jurl / NoBSjs

A Javascript UI framework based on web components (custom elements)

-No re-renders: no DOM parsing, no building of templates with strings. We use real html elements.
-The HTML is the state. We use attributes of html elements, so you can see on the inspector exactly what is happening.
-No compile, no transpile, no build, no node, no package.json, no dependencies.
-Less than 20kb
-We take the best of react, the best of Angular and the best of Vue, and we take out all the complex stuff.
-Super Fast.
-Reusable components
-Scoped styles

APP:

- COMPONENTS:
  A normal html file with a <style>, a single html element (div, span or same as the class), and a script.
  The script part is a js class that extends Component (which Extends html element)

- Events:

  - j-onclick="nameOfMethod"
  - j-onchange="handleChange
  - j-on...

- State and Props
  I treat states and props the same, they are attributes of the html element
  A component with an attribute set with double curly bracks will take the value fromt he parent's state (since the component is instanciated in the parent).
  <my-component username={{user.data.username}} />
  This example creates a "my-component" type of component, which was loaded from a single html file, with the attribute/prop/state of username set to "parent.state.user.data.username". And this is reactive: each time the parent component changes its "state.user" it will trigger an update on the child "my-component". When "my-component" updates it will check the value of parent.user.data.username and the current value it has, and get the new value. And 'rerender'. We don't really use rerender, but it will check where that state is used and update the DOM elements. Only those elements that gotta be updated.

- Data-binding
  {{nameOfState}} takes the value from the state.
  examples:
  <p j-innerhtml="{{person.name}}"></p>
  <img j-src="{{person.image}}">

---

TO DO LIST:
-standarize use of {{}} for functions, arrays, etc
-allow {{()=>alert(1)}}
