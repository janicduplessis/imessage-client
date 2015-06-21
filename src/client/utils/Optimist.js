class Optimist {
  constructor() {
    this.map = {};
  }

  get(id) {
    return this.map[id];
  }

  create(id) {

  }

  update(ref, id) {

  }

  _genGUID() {
    // https://gist.github.com/jed/982883
    return (() => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, a => (a ^ Math.random() * 16 >> a / 4).toString(16)))();
  }
}

export default new Optimist();
