import styles from '../styles/gameButtons.module.css';
import styles2 from '../styles/friends.module.css';
import { PlayButton, SocialMediaFooterButton } from '../components/Buttons';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import otherActions from '../redux/actions/otherActions';
import { useEffect, useState } from 'react';
import FriendCard from '../components/FriendCard';

const GameButtons = (props) => {
  const [filtered, setFiltered] = useState([]);
  const [playWithFriend, setPlayWithFriend] = useState(false);

  const filterFriends = (e) => {
    setFiltered(
      props.userData.friends.filter((user) =>
        user.username.localeCompare(e.target.value)
      )
    );
  };

  useEffect(() => {
    setFiltered(props.userData && props.userData.friends);
  }, [props.userData]);

  return (
    <section
      className={styles.sectionGameButtons}
      style={{ backgroundImage: "url('/assets/background.png')" }}
    >
      <article className={styles.articleGameButtons}>
        <div className={styles.titleArticle}>
          <div className={styles.socialMedia}>
            <SocialMediaFooterButton icon="twitter" />
            <SocialMediaFooterButton icon="instagram" />
            <SocialMediaFooterButton icon="youtube" />
            <SocialMediaFooterButton icon="discord" />
          </div>
          <img
            className={styles.logo}
            src="/assets/LogoRuleta.png"
            alt="logo"
          />
        </div>
        {playWithFriend ? (
          <div
            style={{ display: 'flex', width: '100%', justifyContent: 'center' }}
            className={styles.friendsContainer}
          >
            <div className={styles2.friendsList}>
              <h3 className={styles2.subtitle}>friends List</h3>
              <div className={styles2.listContainer}>
                {filtered &&
                  filtered.map((friend, index) => (
                    <FriendCard
                      type="friends"
                      friend={friend}
                      key={`${friend.username}${index}`}
                      gameReq={true}
                    />
                  ))}
              </div>
              <input
                className={styles2.searchFriend}
                onChange={filterFriends}
                placeholder="Type to search a friend..."
              />
            </div>
            <div className={styles2.friendsList}>
              <h3 className={styles2.subtitle}>game Requests</h3>
              <div className={styles2.listContainer}>
                {props.userData?.game_requests?.length > 0 ? (
                  props.userData.game_requests.map((req, index) => {
                    return (
                      <FriendCard
                        key={`${req.user.username}${index}`}
                        type={req.creator ? 'sentRequest' : 'acceptRequest'}
                        request={req}
                        gameReq={true}
                      />
                    );
                  })
                ) : (
                  <h2>You don't have game requests yet 😔</h2>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.divContainerCards}>
            <div className={styles.divGameButtons}>
              <img
                className={styles.avatars}
                src="/assets/player.png"
                alt="player"
              />
              <Link
                to="/game/single_player"
                onClick={() => props.setPlayNow(true)}
              >
                <PlayButton text="PLAY ALONE" className={styles.buttonPlay} />
              </Link>
            </div>
            <div className={styles.divGameButtons}>
              <img
                className={styles.avatars}
                src="/assets/debate.png"
                alt="debate"
              />
              <PlayButton
                text="PLAY W/ FRIEND"
                className={styles.buttonPlay}
                setPlayWithFriend={setPlayWithFriend}
              />
            </div>
          </div>
        )}
        <div className={styles.footerArticle}>
          <div>
            <p className={styles.pContact}>Contact | Terms of Services</p>
            <p className={styles.pCopyrigth}>2021 | © Mind Hub</p>
          </div>
          <div className={styles.divApps}>
            <div className={styles.containerApps}>
              <img
                src="/assets/playStore.png"
                className={styles.picAppPS}
                alt="playStore"
              />{' '}
              <p className={styles.apps}>android</p>
            </div>
            <div className={styles.containerApps}>
              <img className={styles.picApp} src="/assets/ios.png" alt="ios" />{' '}
              <p className={styles.apps}>ios</p>
            </div>
          </div>
        </div>
        <Link to="/">
          <img
            src="/assets/goback.png"
            className={styles2.goBackHome}
            alt="goback"
          />
        </Link>
      </article>
    </section>
  );
};

const mapStateToProps = (state) => {
  return {
    socket: state.users.socket,
    userData: state.users.userData,
    token: state.users.token,
    username: state.users.username
  };
};

const mapDispatchToProps = {
  setPlayNow: otherActions.setPlayNow
};

export default connect(mapStateToProps, mapDispatchToProps)(GameButtons);
