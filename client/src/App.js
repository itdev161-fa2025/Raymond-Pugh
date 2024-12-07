import React, { Component } from 'react';
import './App.css';
import { Link, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home.js';
import Register from './components/Register/Register.js';
import Login from './components/Login/Login.js';
import axios from 'axios';

class App extends Component {
  state = {
    data: null,
    token: null,
    user: null
  };

  authenticateUser = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.removeItem('user');
      this.setState({ user: null });
    } else {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      axios.get('http://localhost:5000/api/auth', config)
        .then((response) => {
          localStorage.setItem('user', response.data.name);
          this.setState({ user: response.data.name });
        })
        .catch((error) => {
          localStorage.removeItem('user');
          this.setState({ user: null });
          console.error(`Error logging in: ${error}`);
        });
    }
  };

  componentDidMount() {
    axios.get('http://localhost:3001')
      .then((response) => {
        this.setState({
          data: response.data
        });
      })
      .catch((error) => {
        console.error(`Error fetching data: ${error}`);
      });

    this.authenticateUser();
  }

  logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null });
  }

  render() {
    const { user, data } = this.state;

    return (
      <div className='App'>
        <header className='App-header'>
          <h1>GoodThings</h1>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/register">Register</Link></li>
            {user ? (
              <li><Link to="#" onClick={this.logOut}>Log out</Link></li>
            ) : (
              <li><Link to="/login">Log in</Link></li>
            )}
          </ul>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home user={user} data={data} />} />
            <Route path="/register" element={<Register {...authProps} />} />
            <Route path="/login" element={<Login {...authProps} />} />
          </Routes>
        </main>

      </div>
    );
  }
}

export default App;
