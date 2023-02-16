import styles from '../styles/game/statisticGame.module.css';
import styles2 from '../styles/accounts.module.css';
import { connect } from 'react-redux';

const winnerOrLoser = (game, multi_player, player) => {
  if (multi_player) return game.current_player === player;
  else return game.lifes > 0;
};

const StatisticGame = (props) => {
  let percent = Math.round(props.statisticsUser.single_player.win_pct);
  const { multi_player, player } = props.userData.playing_now;
  let playerKey = multi_player ? player : 'player';

  let img = winnerOrLoser(props.game, multi_player, player)
    ? '/assets/winner.png'
    : '/assets/gameover.png';

  return (
    <div className={styles.container}>
      <div className={styles.afterGame}>
        <img className={styles.gameover} src={img} alt="gameOver" />
        <div className={styles.buttonsAfterGame}>
          <button
            onClick={() => props.history.push('/selectgame')}
            className={styles2.playButton}
          >
            <svg
              className={styles2.buttonPlayButton}
              xmlns="http://www.w3.org/1999/xlink"
              viewBox="0 0 163.861 163.861"
            >
              <path d="M34.857,3.613C20.084-4.861,8.107,2.081,8.107,19.106v125.637c0,17.042,11.977,23.975,26.75,15.509L144.67,97.275   c14.778-8.477,14.778-22.211,0-30.686L34.857,3.613z" />
            </svg>
            <strong>PLAY AGAIN</strong>
          </button>
        </div>
      </div>

      <div className={styles.containerStatistics}>
        <div
          className={styles.srcUser}
          style={
            props.statisticsUser && {
              backgroundImage: `url("${props.avatar}")`
            }
          }
        ></div>
        <div className={styles.box1}>
          <div className={styles.boxStatisticGame}>
            <p>PERFORMANCE</p>
            <div className={styles.containerCoinMedalsQuestions}>
              <div className={styles.containerCoin}>
                <img src="/assets/coin.png" alt="coinSpent" />
                <p>{props.game[playerKey].coins_spent}</p>
              </div>
              <div className={styles.containerMedal}>
                <img src="/assets/nosy.png" alt="nosy" />
                <p>{props.game[playerKey].medals.length}</p>
              </div>
              <div className={styles.containerPower}>
                <img src="/assets/punch.png" alt="nosy" />
                <p>{props.game[playerKey].powers_used}</p>
              </div>
            </div>
            <p>
              Total questions:{' ' + props.game[playerKey].questions.length}
            </p>
          </div>
          <div className={styles.boxStatisticUser}>
            <p>STATISTICS</p>
            <p>
              Losses:{' '}
              {' ' +
                props.statisticsUser[
                  multi_player ? 'multi_player' : 'single_player'
                ].losses}
            </p>
            <p>
              Wins:{' '}
              {' ' +
                props.statisticsUser[
                  multi_player ? 'multi_player' : 'single_player'
                ].wins}
            </p>
            <div className={styles.progress}>
              <p>Progress:</p>
              <div className={styles.barra}>
                <div
                  className={styles.barrita}
                  style={{ width: `${percent}px` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    game: state.game.game,
    statisticsUser: state.game.statisticsUser,
    avatar: state.users.avatar,
    userData: state.users.userData
  };
};

export default connect(mapStateToProps)(StatisticGame);
