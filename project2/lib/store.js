export class Store {
  static stores = {};
  subscribers = {};
  static getStore(name) {
    let store = Store.stores[name];
    if (store) return store;
    return new Store(name);
  }

  constructor(name) {
    this.name = name;
    this.proxy = this.createProxy({});
    Store.stores[name] = this;
  }

  createProxy(obj) {
    return new Proxy(obj, {
      set: (target, prop, value) => {
        const oldValue = target[prop];
        target[prop] = value;

        // Notify subscribers if the value changes

        if (oldValue !== value && this.subscribers[prop]) {
          this.subscribers[prop].forEach((callback) =>
            callback(value, oldValue)
          );
        }
        return true;
      },
    });
  }

  setValue(key, val) {
    this.proxy[key] = val;
  }
  getValue(key) {
    return this.proxy[key];
  }

  // Subscribe a component to a specific property
  subscribe(property, callback) {
    if (!this.subscribers[property]) {
      this.subscribers[property] = [];
    }
    this.subscribers[property].push(callback);
  }

  // Unsubscribe a component from a specific property
  unsubscribe(property, callback) {
    if (this.subscribers[property]) {
      this.subscribers[property] = this.subscribers[property].filter(
        (cb) => cb !== callback
      );
    }
  }
}
