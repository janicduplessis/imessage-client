import React from 'react';
import { Link } from 'react-router';

import '../styles/navbar.scss';

class NavBar extends React.Component {
  render() {
    let user = this.props.user;
    let visibleLinks = [];
    if(user === null) {
      visibleLinks.push(<Link to="login" key="10">Login</Link>);
      visibleLinks.push(<Link to="register" key="20">Register</Link>);
    } else {
      visibleLinks.push(<Link to="chat" key="30">Chat</Link>);
      visibleLinks.push(<Link to="logout" key="40">Logout</Link>);
    }
    return (
      <div className="navbar">
        <div className="content">
          <div className="logo">iMessage Web</div>
          <div className="links">{visibleLinks}</div>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  user: React.PropTypes.object,
};

export default NavBar;
