import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ authenticateUser }) => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  
  const [errorData, setErrorData] = useState({ errors: null });

  const { name, email, password, passwordConfirm } = userData;
  const { errors } = errorData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const registerUser = async () => {
    if (password !== passwordConfirm) {
      console.log('Passwords do not match');
    } else {
      const newUser = {
        name: name,
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
        const res = await axios.post('http://localhost:3001/api/users', body, config);
        
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } catch (error) {
        localStorage.removeItem('token');
        setErrorData({
          ...errorData,
          errors: error.response.data.errors
        });
        authenticateUser();
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Name"
        name="name"
        value={name}
        onChange={onChange}
      />
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={email}
        onChange={onChange}
      />
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
        <input
          type="password"
          placeholder="Confirm Password"
          name="passwordConfirm"
          value={passwordConfirm}
          onChange={onChange}
        />
      </div>
      <button onClick={registerUser}>Register</button>

      {errors && errors.map((error) => (
        <div key={error.msg}>{error.msg}</div>
      ))}
    </div>
  );
};

export default Register;
