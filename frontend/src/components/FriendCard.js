import { useState } from 'react';
import { connect } from 'react-redux';
import usersActions from '../redux/actions/usersActions';
import styles from '../styles/friendCard.module.css';
import stylesConected from '../styles/usercard.module.css';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';

const FriendCard = ({
  type,
  request,
  user,
  friend,
  gameReq = false,
  ...props
}) => {
  const history = useHistory();
  const [clicked, setClicked] = useState(false);
  const ImageFriendCard = (
    <div
      className={styles.logo}
      style={{
        backgroundImage: `url('${
          type === 'sendRequest'
            ? user.avatar
            : type === 'friends'
            ? friend.avatar
            : request.user.avatar
        }')`
      }}
    ></div>
  );
  let result =
    type === 'acceptRequest' ? (
      <div className={styles.divFriend}>
        <div className={styles.friendInfo}>
          {ImageFriendCard}
          <h3>{request.user.username}</h3>
        </div>
        <div className={styles.buttons}>
          <button
            id={gameReq ? request.game_id : undefined}
            onClick={(e) =>
              gameReq
                ? props.answerGameRequest(true, e.target.value, e.target.id) &&
                  history.push('/game/multi_player')
                : props.answerFriendRequest(true, e.target.value)
            }
            value={request.user.username}
          >
            ACCEPT
          </button>
        </div>
      </div>
    ) : type === 'sentRequest' ? (
      <div className={styles.divFriend}>
        <div className={styles.friendInfo}>
          {ImageFriendCard}
          <h3>{request.user.username}</h3>
        </div>
        <button
          onClick={(e) => {
            props.addFriend(e.target.value);
            setClicked(true);
            setTimeout(() => props.setUserSearched(null), 1000);
          }}
          disabled={true}
          className={styles.buttonRefuse}
        >
          REQUEST SENT
        </button>
      </div>
    ) : type === 'sendRequest' ? (
      <div className={styles.divFriend}>
        <div className={styles.friendInfo}>
          {ImageFriendCard}
          <h3>{user.username}</h3>
        </div>
        <button
          onClick={(e) => {
            props.addFriend(e.target.value);
            setClicked(true);
            setTimeout(() => props.setUserSearched(null), 1000);
          }}
          disabled={clicked}
          className={clicked ? styles.buttonRefuse : styles.accept}
          value={user.username}
        >
          SEND INVITATION
        </button>
      </div>
    ) : (
      <div className={styles.divFriend}>
        <div className={styles.friendInfo}>
          {ImageFriendCard}
          <h3>{friend.username}</h3>
        </div>
        <div className={styles.connection}>
          {
            <div className={stylesConected.divConnect}>
              <img
                className={stylesConected.connected}
                src={
                  friend.connected
                    ? '/assets/online.png'
                    : '/assets/offline.png'
                }
                alt="conected"
              />
            </div>
          }
          <button
            onClick={() => {
              gameReq
                ? props.sendGameRequest(friend)
                : Swal.fire('This feature is comming soon!');
            }}
            value={friend.username}
          >
            {gameReq ? 'Invite to play' : 'Invite to chat'}
          </button>
        </div>
      </div>
    );

  return (
    <section
      className={
        type === 'sendRequest'
          ? styles.sectionFriendSearched
          : styles.sectionFriend
      }
    >
      <div className={styles.container}>{result}</div>
    </section>
  );
};
const mapStateToProps = (state) => {
  return {
    userData: state.users.userData
  };
};
const mapDispatchToProps = {
  addFriend: usersActions.addFriend,
  answerFriendRequest: usersActions.answerFriendRequest,
  answerGameRequest: usersActions.answerGameRequest,
  sendGameRequest: usersActions.sendGameRequest
};
export default connect(mapStateToProps, mapDispatchToProps)(FriendCard);
