import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../components/common/Button/Button";
import styles from "./Hero.module.css";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import mainImg from "../../../assets/mainHero.avif";
function Hero() {
  return (
    <section className={styles.hero}>
        
      <div className={styles.content}>
        <h1 className={styles.title}>
          Làm Chủ Tiếng Anh <span className={styles.highlight}>Tự Nhiên</span>{" "}
          Cùng AI
        </h1>
        <p className={styles.description}>
          Trải nghiệm tương lai của việc học ngôn ngữ. Nhận phản hồi tức thì về
          phát âm, từ vựng và ngữ pháp thông qua các cuộc hội thoại AI nhập vai.
        </p>

        <div className={styles.actions}>
          <Button onClick={() => console.log("Bắt đầu học ngay")}>
            Bắt đầu học ngay
          </Button>
          <button
            className={styles.outlineBtn}
            onClick={() => console.log("Khám phá khóa học")}
          >
            Khám phá khóa học
          </button>
        </div>

        <div className={styles.socialProof}>
          <div className={styles.avatars}>
            <div className={styles.avatarMock} />
            <div className={styles.avatarMock} />
            <div className={styles.avatarMock} />
          </div>
          <p className={styles.proofText}>
            Tham gia cùng <span className={styles.boldText}>50,000+</span> học
            viên hôm nay
          </p>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        <div className={styles.imageCard}>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
            alt="AI Learning Illustration"
            className={styles.mainImage}
          />

          {/* Thẻ nổi phản hồi trực tiếp */}
          <div className={styles.floatingCard}>
            <div className={styles.iconBox}>
              <FontAwesomeIcon icon={faMicrophone} />
            </div>
            <div>
              <p className={styles.cardTitle}>Phản hồi trực tiếp</p>
              <p className={styles.cardSubtitle}>
                &quot;Phát âm rất tuyệt!&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
