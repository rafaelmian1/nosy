import { useState } from 'react';
import styles from '../styles/accounts.module.css';
import usersActions from '../redux/actions/usersActions';
import { connect } from 'react-redux';
import GoogleLogin from 'react-google-login';
import toast from 'react-hot-toast';

const Login = (props) => {
  const [newUser, setNewUser] = useState({
    username: '',
    password: ''
  });

  const inputHandler = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const welcomeBack = () => {
    toast.success('Welcome back!', {
      style: {
        borderRadius: '10px',
        background: '#453ab7',
        color: '#fff',
        fontFamily: 'Ubuntu, sans-serif'
      }
    });
  };

  const submitButton = async () => {
    const { username, password } = newUser;
    if (username === '' || password === '') {
      return toast.error('There can be no empty fields', {
        position: 'top-right',
        style: {
          borderRadius: '10px',
          background: '#453ab7',
          color: '#fff',
          fontFamily: 'Ubuntu, sans-serif'
        }
      });
    }
    let response = await props.logInUser(newUser);
    if (response.data?.success) {
      welcomeBack();
    }
  };

  const responseGoogle = async (response) => {
    let loginUser = {
      username: response.profileObj?.email?.split('@')?.at(0),
      password: response.profileObj?.googleId,
      google: true
    };
    let res = await props.logInUser(loginUser);
    if (res?.data?.success) {
      welcomeBack();
    }
  };

  return (
    <div className={styles.login}>
      <h1>Log In</h1>
      <div className={styles.inputContainer}>
        <input
          className={styles.inputForm}
          onChange={inputHandler}
          name="username"
          type="text"
          placeholder="Username"
        />
        <input
          className={styles.inputForm}
          onChange={inputHandler}
          name="password"
          type="password"
          placeholder="Password"
        />
      </div>
      <button onClick={submitButton} className={styles.playButton}>
        <svg
          className={styles.buttonPlayButton}
          xmlns="http://www.w3.org/1999/xlink"
          viewBox="0 0 163.861 163.861"
        >
          <path d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275   c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z" />
        </svg>
        <strong>LOG IN</strong>
      </button>
      <p>Or</p>
      <div className={styles.socialMediaLogin}>
        <GoogleLogin
          clientId="82723603056-o12gv1mu2alua7qnd7igq2rlrj6he3gg.apps.googleusercontent.com"
          buttonText="Log in"
          onSuccess={responseGoogle}
          autoLoad={false}
          cookiePolicy={'single_host_origin'}
        />
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  logInUser: usersActions.logInUser
};

export default connect(null, mapDispatchToProps)(Login);
