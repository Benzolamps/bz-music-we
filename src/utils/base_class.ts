export default abstract class BaseClass {
  public constructor() {
    let proto = this as unknown;
    while (proto !== BaseClass.prototype) {
      proto = Object.getPrototypeOf(proto);
      const properties = Object.getOwnPropertyDescriptors(proto);
      delete properties.constructor;
      for (const key in properties) {
        const prop = properties[key];
        if (prop.value instanceof Function) {
          prop.value = prop.value.bind(this);
        }
      }
      Object.defineProperties(this, properties);
    }
  }
}
