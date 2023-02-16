// import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import Account from './pages/Account';
import MenuResponsive from './components/MenuResponsive';
import Game from './pages/Game';
import usersActions from './redux/actions/usersActions';
import otherActions from './redux/actions/otherActions';
import GameButtons from './pages/GameButtons';
import toast, { Toaster } from 'react-hot-toast';
import AdminPanel from './pages/Admin';
import gamesActions from './redux/actions/gamesActions';
import Friends from './pages/Friends';
import socketActions from './redux/actions/socketActions';
import GameMultiPlayer from './pages/GameMultiPlayer';

const App = (props) => {
  useEffect(() => {
    if (localStorage.getItem('token')) {
      props.logInLS();
      props.setGame(localStorage.getItem('token'));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (props.socket) {
      props.socket.on('game_request', ({ username, requests }) => {
        props.setGameRequests(requests, false);
        toast(username + ' invited you to a game!', {
          icon: '🎮'
        });
      });
      props.socket.on(
        'accepted_game_request',
        ({ username, requests, playing_now, game, coins }) => {
          props.setGameRequests(requests, playing_now);
          props.setMultiGame(game, coins);
          toast(username + ' accepted your game invitation!', {
            icon: '🎮'
          });
          window.location.pathname = '/game/multi_player';
        }
      );

      props.socket.on(
        'oponent_answered_question',
        ({ game, username, answer }) => {
          if (!answer) {
            toast(username + ' answered incorrectly, your turn to play!', {
              icon: '🎮'
            });
          }
          props.setMultiGame(game);
        }
      );

      props.socket.on('friend_request', ({ username, requests }) => {
        props.setFriendRequests(requests);
        toast(username + ' has sent you a friend request!', {
          icon: '🤝'
        });
      });
      props.socket.on(
        'accepted_friend_request',
        ({ username, requests, friends }) => {
          props.setFriends(requests, friends);
          toast(
            username + ' accepted your friend request! Invite him to a game',
            {
              icon: '🤝'
            }
          );
        }
      );
      props.socket.on('connected', (username) => {
        if (
          username !== props.username &&
          props.userData.friends.length > 0 &&
          props.userData.friends.some((friend) => friend.username === username)
        ) {
          props.setFriendsList();
        }
      });
      props.socket.on('disconnection', (username) => {
        if (
          username !== props.username &&
          props.userData.friends.length > 0 &&
          props.userData.friends.some((friend) => friend.username === username)
        ) {
          props.setFriendsList();
        }
      });
    }
    // eslint-disable-next-line
  }, [props.socket]);

  return (
    <BrowserRouter>
      <Toaster />
      {props.menu && <MenuResponsive />}
      <Switch>
        <Route exact path="/" {...props} component={Home} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/notfound" component={NotFound} />
        <Route path="/game/single_player" component={Game} />
        <Route path="/game/multi_player" component={GameMultiPlayer} />
        <Route path="/accounts" component={!props.token ? Account : Home} />
        <Route path="/friends" component={Friends} />
        <Route
          path="/selectgame"
          component={!props.token ? Account : GameButtons}
        />
        <Route
          path="/admin"
          component={
            props.userData && props.userData.admin.flag ? AdminPanel : Home
          }
        />
        <Redirect to="/notFound" />
      </Switch>
    </BrowserRouter>
  );
};

const mapStateToProps = (state) => {
  return {
    token: state.users.token,
    menu: state.other.menu,
    socket: state.users.socket,
    username: state.users.username,
    userData: state.users.userData
  };
};

const mapDispatchToProps = {
  logInLS: usersActions.logInLS,
  showMenuResponsive: otherActions.showMenu,
  setGame: gamesActions.setGame,
  setFriendRequests: socketActions.setFriendRequests,
  setFriends: socketActions.setFriends,
  setGameRequests: socketActions.setGameRequests,
  setFriendsList: socketActions.setFriendsList,
  setMultiGame: socketActions.setMultiGame
  // changeCurrentPlayer: socketActions.changeCurrentPlayer,
  // reFetchGameRequests: socketActions.reFetchGameRequests,
  // startGame: socketActions.startGame,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
