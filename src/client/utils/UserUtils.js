export default class {
  static getColorForUser(userName) {
    this.users = this.users || {};
    // Check if we already have generated a color for this user.
    if(this.users[userName]) {
      return this.users[userName];
    }
    // Gives a random color to the user.
    const index = Math.floor(Math.random() * 1e8) % colors.length;

    this.users[userName] = colors[index];
    return this.users[userName];
  }
}

const colors = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
];
