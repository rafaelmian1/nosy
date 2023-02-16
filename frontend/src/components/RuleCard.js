import styles from "../styles/home/rules.module.css";
const RuleCard = (props) => {
  return (
    <div className={styles.card}>
      <div
        className="imgCard"
        style={{ backgroundImage: `url("${props.infoCard.src}}")` }}
      ></div>
      <img src={props.infoCard.src} alt="card_info" />
      <h3>{props.infoCard.title}</h3>
      <p>{props.infoCard.description}</p>
    </div>
  );
};
export default RuleCard;
