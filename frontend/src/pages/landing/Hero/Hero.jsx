import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import styles from "./Hero.module.css";
import {
  faMicrophone,
  faArrowRight,
  faCheck,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";

function Hero() {
  return (
    <section className={styles.hero}>
      {/* Video background */}
      <div className={styles.videoWrap}>
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80"
        >
          <source src="/videos/hero_myweb.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay} />
        <div className={styles.grain} />
      </div>

      {/* Content */}
      <div className={styles.container}>
        <div className={styles.badge}>
          <span className={styles.pulseDot} />
          <span>50,000+ học viên đang học mỗi ngày</span>
        </div>

        <h1 className={styles.title}>
          Học tiếng Anh
          <br />
          <span className={styles.titleAccent}>theo cách của bạn</span>
        </h1>

        <p className={styles.description}>
          Từ luyện nghe, dịch câu đến trò chuyện thực tế với AI. Hệ thống cá
          nhân hóa giúp bạn phản xạ tự nhiên và tự tin giao tiếp.
        </p>

        <div className={styles.actions}>
          <Link to={"/login"}>
            Bắt đầu miễn phí
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>

          {/* Nút dùng thẻ button, sẽ được CSS gốc bắt style */}
          <button>
            Tư vấn lộ trình
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        <ul className={styles.trustRow}>
          <li>
            <FontAwesomeIcon icon={faCheck} /> Học mọi lúc, mọi nơi
          </li>
          <li>
            <FontAwesomeIcon icon={faCheck} /> Không sợ sai, AI sửa ngay
          </li>
          <li>
            <FontAwesomeIcon icon={faCheck} /> Phản hồi trong 24h
          </li>
        </ul>
      </div>

      {/* Floating widgets */}
      {/* <div className={`${styles.widget} ${styles.widgetLeft}`}>
        <div className={styles.waveIcon}>
          <FontAwesomeIcon icon={faWaveSquare} />
        </div>
        <div>
          <p className={styles.widgetLabel}>Phát âm</p>
          <p className={styles.widgetValue}>98% chính xác</p>
        </div>
      </div> */}

      {/* <div className={`${styles.widget} ${styles.widgetRight}`}>
        <div className={styles.widgetAvatar}>
          <FontAwesomeIcon icon={faMicrophone} />
        </div>
        <div>
          <p className={styles.widgetLabel}>AI đang nghe</p>
          <div className={styles.waveBars}>
            <span /> <span /> <span /> <span /> <span />
          </div>
        </div>
      </div> */}

      {/* Scroll cue */}
      <div className={styles.scrollCue}>
        <span>Cuộn xuống</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}

export default Hero;
