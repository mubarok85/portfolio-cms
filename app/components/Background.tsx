import styles from "./Background.module.css";

const particles = [
  styles.particleOne,
  styles.particleTwo,
  styles.particleThree,
];

export default function Background() {
  return (
    <div
      aria-hidden="true"
      className={styles.background}
    >
      <div className={styles.base} />

      <div
        className={`${styles.aurora} ${styles.auroraOne}`}
      />

      <div
        className={`${styles.aurora} ${styles.auroraTwo}`}
      />

      <div className={styles.grid} />

      <div className={styles.stars} />

      <div className={styles.vignette} />

      {particles.map((particleClass, index) => (
        <span
          key={particleClass}
          className={`${styles.particle} ${particleClass}`}
          style={{
            animationDelay: `${index * 1.8}s`,
          }}
        />
      ))}
    </div>
  );
}