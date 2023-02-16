import styles from '../styles/game/roulette.module.css';
import style from '../styles/game/questionCard.module.css';
import { connect } from 'react-redux';

const RouletteMultiPlayer = (props) => {
  const shadows = [
    { no: 'shadow4.png', yes: 'music.png', key: 'Music' },
    { no: 'shadow5.png', yes: 'computer.png', key: 'Science: Computers' },
    { no: 'shadow3.png', yes: 'cultura.png', key: 'General Knowledge' },
    { no: 'shadow1.png', yes: 'animals.png', key: 'Animals' },
    { no: 'shadow2.png', yes: 'movies.png', key: 'Movies and series' }
  ];

  return (
    <div className={styles.rouletteContainer}>
      <div className={styles.topInfo}>
        <div className={style.containerInfoGame}>
          <img
            className={style.imgInfoGame}
            src="/assets/coin.png"
            alt="coin"
          />
          <span>{props.coins && props.coinsFront}</span>
        </div>
        <div className={style.containerInfoGame}>
          <img
            className={style.imgInfoGame}
            src="/assets/heart_2.png"
            alt="heart"
          />
          <span>{props.game && props.game.lifes}</span>
        </div>
      </div>
      <div className={styles.containerRoulette}>
        <img
          src="/assets/ruleta1.svg"
          ref={props.roulette}
          className={styles.roulette}
          alt="rouletteeee"
        />
        <img
          src="/assets/spin3.png"
          alt="spins"
          className={styles.buttonRoulette}
          onClick={() => {
            !props.playing &&
              props.userData.playing_now.player === props.game.current_player &&
              props.rotate();
          }}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={styles.logoUser}
              style={{
                marginInline: '1rem',
                backgroundImage: `url('${props?.game?.player1?.user?.avatar}')`,
                height: '50px',
                width: '50px',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                borderRadius: '50%'
              }}
            ></div>
            <h4>{props?.game?.player1?.user?.username}</h4>
          </div>
          <div className={styles.shadowsMultiplayer}>
            {props.game &&
              shadows.map((shadow) => (
                <img
                  key={shadow.key}
                  className={styles.picShadow}
                  src={`/assets/${
                    props.game?.player1?.medals?.includes(shadow.key)
                      ? shadow.yes
                      : shadow.no
                  }`}
                  alt={shadow.key}
                />
              ))}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4>{props?.game?.player2?.user?.username}</h4>
            <div
              className={styles.logoUser}
              style={{
                marginInline: '1rem',
                backgroundImage: `url('${props?.game?.player2?.user?.avatar}')`,
                height: '50px',
                width: '50px',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                borderRadius: '50%'
              }}
            ></div>
          </div>
          <div className={styles.shadowsMultiplayer}>
            {props.game &&
              shadows.map((shadow) => (
                <img
                  key={shadow.key}
                  className={styles.picShadow}
                  src={`/assets/${
                    props.game?.player2?.medals?.includes(shadow.key)
                      ? shadow.yes
                      : shadow.no
                  }`}
                  alt={shadow.key}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    game: state.game.game,
    coins: state.game.coins,
    user: state.users.user,
    userData: state.users.userData
  };
};

export default connect(mapStateToProps)(RouletteMultiPlayer);
