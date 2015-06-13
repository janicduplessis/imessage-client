/**
 * Wrapper around localStorage.
 */
export default class Storage {
  static getItem(key) {
    let itemStr = localStorage.getItem(key);
    if(!itemStr) {
      return null;
    }
    let item = JSON.parse(itemStr);
    return item.data;
  }

  static setItem(key, item) {
    let itemStr = JSON.stringify({
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
