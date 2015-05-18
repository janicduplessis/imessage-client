import React from 'react';
import { Link } from 'react-router';

class NavBar extends React.Component {
  render() {
    let user = this.props.user;
    let visibleLinks = [];
    if(user === null) {
      visibleLinks.push(<Link to="login" key="10">Login</Link>);
      visibleLinks.push(<Link to="register" key="20">Register</Link>);
    } else {
      visibleLinks.push(<Link to="chat" key="30">Chat</Link>);
    }
    return (
      <div>
        {visibleLinks}
      </div>
    );
  }
}

NavBar.propTypes = {
  user: React.PropTypes.object,
};

export default NavBar;
