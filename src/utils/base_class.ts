export default abstract class BaseClass {
  public constructor() {
    const props: PropertyDescriptorMap = {};
    let proto = this as unknown;
    while (proto !== BaseClass.prototype) {
      proto = Object.getPrototypeOf(proto);
      const properties = Object.getOwnPropertyDescriptors(proto);
      for (const key in properties) {
        const prop = properties[key];
        if (key !== 'constructor' && !(key in props) && prop.value instanceof Function) {
          prop.value = prop.value.bind(this);
          props[key] ??= prop;
        }
      }
    }
    Object.defineProperties(this, props);
  }
}
