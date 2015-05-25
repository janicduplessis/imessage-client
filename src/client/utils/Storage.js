/**
 * Wrapper around localStorage.
 */
export default class Storage {
  static getItem(key) {
    const itemStr = localStorage.getItem(key);
    if(!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    return item.data;
  }

  static setItem(key, item) {
    const itemStr = JSON.stringify({
      data: item,
    });
    localStorage.setItem(key, itemStr);
  }

  static removeItem(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}
