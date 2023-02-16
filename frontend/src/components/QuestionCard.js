import styles from '../styles/game/questionCard.module.css';
import { connect } from 'react-redux';
import questionActions from '../redux/actions/questionsActions';
import { useState, useEffect, useRef } from 'react';
import gamesActions from '../redux/actions/gamesActions';
import toast from 'react-hot-toast';

const QuestionCard = (props) => {
  const { question, possibleAnswers, correctAnswer, category } = props.question;
  const [click, setClick] = useState(false);
  let repeatAnswerRef = useRef(false);
  const [answers, setAnswers] = useState([]);
  const [bomb, setBomb] = useState([]);
  const [repeatAnswer, setRepeatAnswer] = useState(false);
  const [incorrect, setIncorrect] = useState(false);
  const [audio, setAudio] = useState({});
  let answersContainer = useRef();
  const [seconds, setSeconds] = useState(15);

  let timeOut = useRef();
  const sendAnswer = async (answer, powers_used, coins_spent) => {
    let res = await props.sendAnswer(
      props.question,
      answer,
      props.golden,
      powers_used,
      coins_spent
    );
    const player = res.newGameState?.current_player ?? 'player';
    let flag = res.newGameState[player].questions.filter(
      (qs) => qs.answer
    ).length;
    let flag2 = res.newGameState[player].questions?.at(-1)?.answer;
    props.setGolden(flag !== 0 && flag % 3 === 0 && !!flag2); //
    await props.setNosy(flag !== 0 && flag % 3 === 0 && !!flag2); //
  };
  useEffect(() => {
    if (seconds > 0) {
      timeOut.current = setTimeout(() => {
        setSeconds(seconds - 1);
      }, 1000);
    } else if (seconds === 0 && !click) {
      let coins_spent = bomb.length !== 0 ? 30 : 0;
      coins_spent += repeatAnswerRef.current ? 25 : 0;
      coins_spent += props.reRoll.current ? 20 : 0;
      let powers_used =
        repeatAnswerRef.current || bomb.length > 0 || props.reRoll.current
          ? 1
          : 0;
      props.reRoll.current = false;
      repeatAnswerRef.current = false;
      if (props.token && seconds === 0) {
        sendAnswer(false, powers_used, coins_spent);
      }
      setTimeout(() => {
        setIncorrect(true);
      }, 1500);
      setTimeout(() => {
        props.setQuestion(null);
        props.setPlaying(false);
      }, 2500);
    }
    return () => clearTimeout(timeOut.current);
    // eslint-disable-next-line
  }, [seconds]);

  useEffect(() => {
    let questionAudio = new Audio('/assets/question.wav');
    let correctAudio = new Audio('/assets/correct.wav');
    let incorrectAudio = new Audio('/assets/incorrect.wav');
    props.setNosy(null);
    questionAudio.play();
    setAudio({ correctAudio, incorrectAudio });
    setAnswers(possibleAnswers.sort(() => Math.random() - 0.5));
    // eslint-disable-next-line
  }, []);
  const infoLifes = (
    <div className={styles.infoLifes}>
      <img className={styles.heart} src="/assets/heart.png" alt="heart" />
      <h3>You lost {props.game.player1 ? 'your turn' : 'a life'}!</h3>
    </div>
  );
  const clickHandler = (e) => {
    let answer = correctAnswer === e.target.name;
    answer ? audio.correctAudio.play() : audio.incorrectAudio.play();
    if (!repeatAnswer || answer) {
      props.category(null);
      Array.from(answersContainer.current.children).forEach((answer) => {
        if (answer.name === correctAnswer && answers.length > 2) {
          answer.className = ` ${styles.buttonOption}  ${styles.correct}`;
        } else if (answer.name !== correctAnswer && answers.length > 2) {
          answer.className = ` ${styles.buttonOption}  ${styles.incorrect}`;
        } else if (answer.name === correctAnswer && answers.length === 2) {
          answer.className = ` ${styles.buttonOption}  ${styles.correct2}`;
        } else if (answer.name !== correctAnswer && answers.length === 2) {
          answer.className = ` ${styles.buttonOption}  ${styles.incorrect2}`;
        }
      });
      setClick(true);
      let coins_spent = bomb.length !== 0 ? 30 : 0;
      coins_spent += repeatAnswerRef.current ? 25 : 0;
      coins_spent += props.reRoll.current ? 20 : 0;
      let powers_used =
        repeatAnswerRef.current || bomb.length > 0 || props.reRoll.current
          ? 1
          : 0;
      props.reRoll.current = false;
      repeatAnswerRef.current = false;
      if (props.token) {
        sendAnswer(answer, powers_used, coins_spent);
      }
      !answer &&
        setTimeout(() => {
          setIncorrect(true);
        }, 1500);
      setTimeout(
        () => {
          props.setQuestion(null);
          props.setPlaying(false);
        },
        answer ? 1500 : 2500
      );
    }
    if (repeatAnswer && !answer) {
      e.target.className = ` ${styles.buttonOption}  ${styles.incorrect}`;
    }
    repeatAnswer && setRepeatAnswer(false);
  };

  const Bomb = () => {
    props.setCoinsFront(props.coinsFront - 30);
    const cualquiera = Math.floor(Math.random() * 3);
    setBomb(
      possibleAnswers
        .filter((ans) => ans !== correctAnswer)
        .filter((ans, index) => index !== cualquiera)
    );
  };
  const categories = {
    'Movies and series': 'movies.png',
    Music: 'music.png',
    'General Knowledge': 'cultura.png',
    'Science: Computers': 'computer.png',
    Animals: 'animals.png'
  };
  return (
    <section
      className={styles.sectionQuestion}
      style={{ backgroundImage: "url('/assets/background.png')" }}
    >
      {incorrect ? (
        infoLifes
      ) : (
        <article className={styles.card}>
          <div className={styles.containerSeconds2}>
            <img
              className={styles.logo}
              src="/assets/LogoRuleta.png"
              alt="logo"
            />
            <div className={styles.ContainerCoinsTimeLife}>
              <div className={styles.coinInfo}>
                <img
                  className={styles.imgInfoGame}
                  src="/assets/coin.png"
                  alt="coin"
                />
                <span>{props.coinsFront}</span>
              </div>
              <div className={styles.containerInfoGame}>
                <img
                  className={styles.imgInfoGame}
                  src="/assets/heart_2.png"
                  alt="heart"
                />
                <span>{props.game && props.game.lifes}</span>
              </div>
              <p className={styles.seconds}>
                {('0' + seconds).slice(-2) + '"'}
              </p>
            </div>
          </div>
          <div className={styles.containerGlobal}>
            <div className={styles.containerLogo}>
              <div className={styles.category}>
                <img
                  className={styles.imgCategory}
                  src={`/assets/${categories[category]}`}
                  alt="img"
                />
                <h2>{category}</h2>
              </div>
              <h3>{question}</h3>
            </div>
            <div ref={answersContainer} className={styles.containerButtons}>
              {bomb.length === 0
                ? answers.map((string, index) => {
                    return (
                      <button
                        key={index}
                        className={
                          answers.length === 2
                            ? styles.button2option
                            : styles.buttonOption
                        }
                        name={string}
                        onClick={clickHandler}
                        disabled={click}
                      >
                        {string}
                      </button>
                    );
                  })
                : answers.map((string, index) => {
                    return (
                      <button
                        key={index}
                        className={
                          bomb.includes(string)
                            ? styles.buttonOptionBombed
                            : styles.buttonOption
                        }
                        name={string}
                        onClick={clickHandler}
                        disabled={bomb.includes(string)}
                      >
                        {string}
                      </button>
                    );
                  })}
            </div>

            <div className={styles.powersButtons}>
              {answers.length > 2 && (
                <>
                  <button
                    disabled={repeatAnswer || bomb.length !== 0}
                    className={
                      props.coins < 30 ? styles.noMoney : styles.buttonOption
                    }
                    onClick={() => {
                      props.coins > 29 && Bomb();
                      props.coins < 30 && toast.error("You can't buy this.");
                    }}
                  >
                    <img
                      className={styles.imgPowers}
                      src="/assets/bomb.png"
                      alt="bomb"
                    />
                    <div className={styles.containerIconsPowers}>
                      <h5>Bomb!</h5>
                      <div className={styles.containerCoins}>
                        <h6> 30 </h6>
                        <img
                          className={styles.imgPowersCoin}
                          src="/assets/coin.png"
                          alt="coin"
                        />
                      </div>
                    </div>
                  </button>
                  <button
                    disabled={repeatAnswer || bomb.length !== 0}
                    className={
                      props.coins < 25 ? styles.noMoney : styles.buttonOption
                    }
                    onClick={() => {
                      if (props.coins > 24) {
                        props.setCoinsFront(props.coinsFront - 25);
                        repeatAnswerRef.current = true;
                        setRepeatAnswer(true);
                      }
                      props.coins < 25 && toast.error("You can't buy this.");
                    }}
                  >
                    <img
                      className={styles.imgPowers}
                      src="/assets/repeat.png"
                      alt="repeat"
                    />
                    <div className={styles.containerIconsPowers}>
                      <h5>Repeat</h5>
                      <div className={styles.containerCoins}>
                        <h6> 25 </h6>
                        <img
                          className={styles.imgPowersCoin}
                          src="/assets/coin.png"
                          alt="coin"
                        />
                      </div>
                    </div>
                  </button>
                </>
              )}
              <button
                disabled={repeatAnswer || bomb.length !== 0}
                className={
                  props.coins < 20 ? styles.noMoney : styles.buttonOption
                }
                onClick={() => {
                  if (props.coins > 19) {
                    props.setCoinsFront(props.coinsFront - 20);
                    props.reRoll.current = true;
                    props.setPlaying(false);
                    props.setQuestion(null);
                  }
                  props.coins < 20 && toast.error("You can't buy this.");
                }}
              >
                <img
                  className={styles.imgPowers}
                  src="/assets/lottery.png"
                  alt="Roll"
                />
                <div className={styles.containerIconsPowers}>
                  <h5>Roll</h5>
                  <div className={styles.containerCoins}>
                    <h6> 20 </h6>
                    <img
                      className={styles.imgPowersCoin}
                      src="/assets/coin.png"
                      alt="coin"
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  );
};

const mapStateToProps = (state) => {
  return {
    token: state.users.token,
    game: state.game.game,
    coins: state.game.coins
  };
};

const mapDispatchToProps = {
  renderRoulette: questionActions.rouletteRender,
  sendAnswer: gamesActions.sendAnswer
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionCard);
