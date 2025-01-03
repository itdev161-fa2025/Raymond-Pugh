import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ authenticateUser }) => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    email: '',
    password: ''
  });

  const [errorData, setErrorData] = useState({ errors: null });

  const { email, password } = userData;
  const { errors } = errorData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const loginUser = async () => {
    const newUser = {
      email: email,
      password: password
    };

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify(newUser);
      const res = await axios.post('http://localhost:3001/api/login', body, config);

      // Store user data and redirect
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      // Clear user data and set errors
      localStorage.removeItem('token');
      setErrorData({
        ...errorData,
        errors: error.response.data.errors
      });
      authenticateUser();
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      <div>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={onChange}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
        />
      </div>
      <div>
        <button onClick={loginUser}>Log In</button>
      </div>
      <div>
        {errors && errors.map((error) => (
          <div key={error.msg}>{error.msg}</div>
        ))}
      </div>
    </div>
  );
};

export default Login;
