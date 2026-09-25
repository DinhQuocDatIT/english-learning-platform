import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faTrophy,
  faMedal,
  faFire,
  faZap,
  faBookOpen,
  faSyncAlt,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Leaderboard.module.css";

// Mock dataset with 55 students
const rawStudents = [
  { name: "Minh Anh", xp: 9850, avatar: "MA", streak: 42, lessons: 156, title: "Vô Song Học Thần", quote: "Học không ngừng nghỉ, chinh phục mọi đỉnh cao!", aura: "gold" },
  { name: "Tuấn Kiệt", xp: 9420, avatar: "TK", streak: 38, lessons: 142, title: "Tinh Anh Tri Thức", quote: "Tri thức là sức mạnh vô hạn.", aura: "violet" },
  { name: "Ngọc Hà", xp: 9180, avatar: "NH", streak: 35, lessons: 138, title: "Tiên Phong Bút Phá", quote: "Nỗ lực mỗi ngày, vươn tầm ước mơ.", aura: "amber" },
  { name: "Hoàng Nam", xp: 8940, avatar: "HN", streak: 30, lessons: 125, title: "⚡ Bậc Thầy Từ Vựng" },
  { name: "Phương Linh", xp: 8710, avatar: "PL", streak: 28, lessons: 119, title: "🛡️ Dũng Sĩ Ngữ Pháp" },
  { name: "Đức Anh", xp: 8560, avatar: "DA", streak: 25, lessons: 112, title: "💫 Ngôi Sao Đang Phủ" },
  { name: "Khánh Vy", xp: 8390, avatar: "KV", streak: 24, lessons: 108, title: "🔥 Chiến Thần Chăm Chỉ", isCurrentUser: true },
  { name: "Gia Huy", xp: 8210, avatar: "GH", streak: 22, lessons: 102, title: "🌟 Tiên Phong Học Tập" },
  { name: "Thảo My", xp: 8050, avatar: "TM", streak: 21, lessons: 98, title: "💎 Thần Đồng Phát Âm" },
  { name: "Quốc Bảo", xp: 7920, avatar: "QB", streak: 19, lessons: 94, title: "🚀 Cao Thủ Tốc Độ" },
  { name: "Hải Yến", xp: 7780, avatar: "HY" },
  { name: "Thanh Tùng", xp: 7650, avatar: "TT" },
  { name: "Bảo Ngọc", xp: 7510, avatar: "BN" },
  { name: "Minh Khang", xp: 7390, avatar: "MK" },
  { name: "Lan Anh", xp: 7250, avatar: "LA" },
  { name: "Nhật Minh", xp: 7120, avatar: "NM" },
  { name: "Mai Chi", xp: 6980, avatar: "MC" },
  { name: "Hoàng Long", xp: 6840, avatar: "HL" },
  { name: "Yến Nhi", xp: 6710, avatar: "YN" },
  { name: "Đăng Khoa", xp: 6590, avatar: "DK" },
  { name: "Thu Trang", xp: 6470, avatar: "TT" },
  { name: "Văn Minh", xp: 6350, avatar: "VM" },
  { name: "Ngọc Mai", xp: 6240, avatar: "NM" },
  { name: "Anh Duy", xp: 6120, avatar: "AD" },
  { name: "Hà My", xp: 6010, avatar: "HM" },
  { name: "Trọng Nghĩa", xp: 5900, avatar: "TN" },
  { name: "Khôi Nguyên", xp: 5790, avatar: "KN" },
  { name: "Thùy Linh", xp: 5680, avatar: "TL" },
  { name: "Đức Huy", xp: 5570, avatar: "DH" },
  { name: "Kim Anh", xp: 5460, avatar: "KA" },
  { name: "Quang Huy", xp: 5350, avatar: "QH" },
  { name: "Mỹ Linh", xp: 5240, avatar: "ML" },
  { name: "Anh Khoa", xp: 5130, avatar: "AK" },
  { name: "Bích Ngọc", xp: 5020, avatar: "BN" },
  { name: "Hoàng Anh", xp: 4910, avatar: "HA" },
  { name: "Thanh Hà", xp: 4800, avatar: "TH" },
  { name: "Minh Quân", xp: 4690, avatar: "MQ" },
  { name: "Hương Giang", xp: 4580, avatar: "HG" },
  { name: "Trung Kiên", xp: 4470, avatar: "TK" },
  { name: "Ngọc Ánh", xp: 4360, avatar: "NA" },
  { name: "Tuệ Minh", xp: 4250, avatar: "TM" },
  { name: "Phúc An", xp: 4140, avatar: "PA" },
  { name: "Khánh Linh", xp: 4030, avatar: "KL" },
  { name: "Gia Bảo", xp: 3920, avatar: "GB" },
  { name: "Hoài Nam", xp: 3810, avatar: "HN" },
  { name: "Thùy Dương", xp: 3700, avatar: "TD" },
  { name: "Đình Phong", xp: 3590, avatar: "DP" },
  { name: "Ngọc Lan", xp: 3480, avatar: "NL" },
  { name: "Hữu Phước", xp: 3370, avatar: "HP" },
  { name: "Mai Anh", xp: 3260, avatar: "MA" },
];

function Leaderboard() {
  const [likedUsers, setLikedUsers] = useState({});

  // Process data
  const processedStudents = useMemo(() => {
    let list = rawStudents.map((item, index) => {
      const streak = item.streak || Math.max(3, Math.floor((item.xp / 9850) * 40));
      const lessons = item.lessons || Math.max(10, Math.floor((item.xp / 9850) * 150));

      return {
        ...item,
        originalIndex: index + 1,
        streak,
        lessons,
        currentXp: item.xp,
      };
    });

    list.sort((a, b) => b.currentXp - a.currentXp);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, []);

  const top1 = processedStudents.find((s) => s.rank === 1) || processedStudents[0];
  const top2 = processedStudents.find((s) => s.rank === 2) || processedStudents[1];
  const top3 = processedStudents.find((s) => s.rank === 3) || processedStudents[2];

  const toggleLike = (name) => {
    setLikedUsers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const maxXp = top1 ? top1.currentXp : 10000;

  return (
    <div className={styles.leaderboardContainer}>
      {/* ⚡ PURE WHITE BACKGROUND WITH CRACKLING MULTI-COLOR LIGHTNING BOLTS & GOKU KI AURA ⚡ */}
      <div className={styles.gokuKiAuraBgWrapper}>
        {/* ⚡ SVG CRACKLING LIGHTNING BOLT PATHS (VÀNG, ĐỎ, XANH ELECTRIC) ⚡ */}
        <svg className={styles.lightningSvgContainer} viewBox="0 0 1200 1000" preserveAspectRatio="none">
          {/* Gold Lightning Bolt Left */}
          <path
            d="M 120 0 L 160 180 L 110 240 L 180 420 L 130 480 L 210 720 L 150 780 L 220 1000"
            className={`${styles.lightningPath} ${styles.lightningGold}`}
          />
          {/* Red/Crimson Lightning Bolt Center-Left */}
          <path
            d="M 380 0 L 340 210 L 400 260 L 320 460 L 370 510 L 290 760 L 350 810 L 300 1000"
            className={`${styles.lightningPath} ${styles.lightningRed}`}
          />
          {/* Cyan Electric Arc Center-Right */}
          <path
            d="M 820 0 L 870 190 L 810 250 L 890 440 L 830 500 L 910 740 L 850 800 L 900 1000"
            className={`${styles.lightningPath} ${styles.lightningCyan}`}
          />
          {/* Amber-Red Lightning Bolt Right */}
          <path
            d="M 1080 0 L 1030 220 L 1090 280 L 1020 500 L 1070 550 L 1000 790 L 1050 840 L 990 1000"
            className={`${styles.lightningPath} ${styles.lightningAmber}`}
          />
        </svg>

        {/* 1. Giant Rising Ki Flame Aura Layers */}
        <div className={`${styles.gokuKiFlame} ${styles.flameGold}`} />
        <div className={`${styles.gokuKiFlame} ${styles.flameRed}`} />
        <div className={`${styles.gokuKiFlame} ${styles.flameCyan}`} />

        {/* 2. Vertical Shooting Ki Energy Beams */}
        <div className={`${styles.gokuKiBeam} ${styles.beamLeft}`} />
        <div className={`${styles.gokuKiBeam} ${styles.beamCenter}`} />
        <div className={`${styles.gokuKiBeam} ${styles.beamRight}`} />

        {/* 3. Radiating Ki Shockwave Circles */}
        <div className={`${styles.gokuShockwaveRing} ${styles.swRing1}`} />
        <div className={`${styles.gokuShockwaveRing} ${styles.swRing2}`} />
        <div className={`${styles.gokuShockwaveRing} ${styles.swRing3}`} />
        <div className={`${styles.gokuShockwaveRing} ${styles.swRing4}`} />

        {/* 4. Ascending Super Saiyan Ki Particles & Lightning Arcs */}
        <div className={`${styles.kiParticleFly} ${styles.kp1}`}>⚡</div>
        <div className={`${styles.kiParticleFly} ${styles.kp2}`}>🔥</div>
        <div className={`${styles.kiParticleFly} ${styles.kp3}`}>💥</div>
        <div className={`${styles.kiParticleFly} ${styles.kp4}`}>⚡</div>
        <div className={`${styles.kiParticleFly} ${styles.kp5}`}>✨</div>
        <div className={`${styles.kiParticleFly} ${styles.kp6}`}>⚡</div>
        <div className={`${styles.kiParticleFly} ${styles.kp7}`}>🔥</div>
        <div className={`${styles.kiParticleFly} ${styles.kp8}`}>⚡</div>
        <div className={`${styles.kiParticleFly} ${styles.kp9}`}>💥</div>
        <div className={`${styles.kiParticleFly} ${styles.kp10}`}>⚡</div>
        <div className={`${styles.kiParticleFly} ${styles.kp11}`}>🔥</div>
        <div className={`${styles.kiParticleFly} ${styles.kp12}`}>⚡</div>

        {/* Crisp Pure White Overlay Layer */}
        <div className={styles.whiteKiOverlay} />
      </div>

      {/* 2. ELEGANT HERO HEADER SECTION */}
      <header className={styles.header}>
        <div className={styles.headerTitleGlowSpot} />
        
        <div className={styles.headerBadge}>
          <FontAwesomeIcon icon={faTrophy} className={styles.badgeIcon} />
          <span className={styles.headerBadgeText}>BẢNG XẾP HẠNG BÁ KHÍ & TRI THỨC</span>
        </div>

        <h1 className={styles.headerTitle}>
          Vinh Danh <span className={styles.gradientText}>Học Thần & Anh Hùng</span>
        </h1>
        <p className={styles.headerSubtitle}>
          Khai phá Bá Khí, chinh phục tri thức và khẳng định vị thế dẫn đầu trên con đường học tập!
        </p>
      </header>

      {/* 3. HERO PODIUM - TOP 3 BÁ KHÍ & AURA */}
      {top1 && top2 && top3 && (
        <section className={styles.podiumSection}>
          <div className={styles.podiumTitleBox}>
            <FontAwesomeIcon icon={faCrown} className={styles.crownIconHeader} />
            <h2 className={styles.podiumSectionHeading}>BẢNG PHONG THẦN TOP 3 BÁ KHÍ</h2>
          </div>

          <div className={styles.podiumGrid}>
            {/* RANK 2 - SILVER / VIOLET AURA (LEFT) */}
            <div className={`${styles.podiumCard} ${styles.rank2Card}`}>
              <div className={styles.rankBadgeTop}>
                <FontAwesomeIcon icon={faMedal} className={styles.rank2Icon} />
                <span className={styles.rankBadgeText}>HẠNG 2</span>
              </div>

              <div className={styles.avatarAuraContainer}>
                <div className={`${styles.auraRing} ${styles.auraRingViolet}`} />
                <div className={`${styles.auraPulse} ${styles.auraPulseViolet}`} />
                <div className={styles.avatarCircle}>
                  <span className={styles.avatarText}>{top2.avatar}</span>
                </div>
                <div className={styles.crownSilver}>🥈</div>
              </div>

              <div className={styles.nicknameTagViolet}>
                <FontAwesomeIcon icon={faZap} />
                <span className={styles.nicknameText}>{top2.title || "Tinh Anh Tri Thức"}</span>
              </div>

              <h3 className={styles.studentName}>{top2.name}</h3>

              <div className={styles.podiumStats}>
                <div className={styles.statChip}>
                  <FontAwesomeIcon icon={faZap} className={styles.iconXp} />
                  <span className={styles.statChipText}>{top2.currentXp.toLocaleString("vi-VN")} XP</span>
                </div>
                <div className={styles.statChip}>
                  <FontAwesomeIcon icon={faFire} className={styles.iconStreak} />
                  <span className={styles.statChipText}>{top2.streak} Ngày</span>
                </div>
              </div>

              <p className={styles.mottoText}>"{top2.quote || "Tri thức là sức mạnh vô hạn."}"</p>

              <button
                className={`${styles.likeBtn} ${likedUsers[top2.name] ? styles.liked : ""}`}
                onClick={() => toggleLike(top2.name)}
              >
                <FontAwesomeIcon icon={faHeart} />
                <span className={styles.btnLabelText}>
                  {likedUsers[top2.name] ? "Đã Bái Phục" : "Bái Phục (942)"}
                </span>
              </button>
            </div>

            {/* RANK 1 - GOLD SUNBURST AURA (CENTER) */}
            <div className={`${styles.podiumCard} ${styles.rank1Card}`}>
              <div className={styles.crownBannerGold}>
                <FontAwesomeIcon icon={faCrown} />
                <span className={styles.bannerText}>VÔ SONG QUÁN QUÂN</span>
              </div>

              <div className={styles.avatarAuraContainerGold}>
                <div className={`${styles.auraRing} ${styles.auraRingGold}`} />
                <div className={`${styles.auraPulse} ${styles.auraPulseGold}`} />
                <div className={styles.sparkleParticles}>
                  <span className={styles.sparkle1}>✨</span>
                  <span className={styles.sparkle2}>⭐</span>
                  <span className={styles.sparkle3}>🌟</span>
                  <span className={styles.sparkle4}>✨</span>
                </div>
                <div className={styles.avatarCircleGold}>
                  <span className={styles.avatarTextGold}>{top1.avatar}</span>
                </div>
                <div className={styles.crownGoldSupreme}>👑</div>
              </div>

              <div className={styles.nicknameTagGold}>
                <FontAwesomeIcon icon={faCrown} />
                <span className={styles.nicknameTextGold}>{top1.title || "Vô Song Học Thần"}</span>
              </div>

              <h3 className={styles.studentNameGold}>{top1.name}</h3>

              <div className={styles.podiumStatsGold}>
                <div className={styles.statChipGold}>
                  <FontAwesomeIcon icon={faZap} className={styles.iconXpGold} />
                  <strong className={styles.statChipStrong}>{top1.currentXp.toLocaleString("vi-VN")} XP</strong>
                </div>
                <div className={styles.statChipGold}>
                  <FontAwesomeIcon icon={faFire} className={styles.iconStreakGold} />
                  <strong className={styles.statChipStrong}>{top1.streak} Ngày Streak</strong>
                </div>
                <div className={styles.statChipGold}>
                  <FontAwesomeIcon icon={faBookOpen} className={styles.iconBookGold} />
                  <strong className={styles.statChipStrong}>{top1.lessons} Bài Học</strong>
                </div>
              </div>

              <p className={styles.mottoTextGold}>"{top1.quote || "Học không ngừng nghỉ, chinh phục mọi đỉnh cao!"}"</p>

              <button
                className={`${styles.likeBtnGold} ${likedUsers[top1.name] ? styles.liked : ""}`}
                onClick={() => toggleLike(top1.name)}
              >
                <FontAwesomeIcon icon={faHeart} />
                <span className={styles.btnLabelText}>
                  {likedUsers[top1.name] ? "Đã Tôn Vẫn" : "Tôn Vẫn Học Thần (1,850)"}
                </span>
              </button>
            </div>

            {/* RANK 3 - AMBER / ROSE FLAME AURA (RIGHT) */}
            <div className={`${styles.podiumCard} ${styles.rank3Card}`}>
              <div className={styles.rankBadgeTop}>
                <FontAwesomeIcon icon={faMedal} className={styles.rank3Icon} />
                <span className={styles.rankBadgeText}>HẠNG 3</span>
              </div>

              <div className={styles.avatarAuraContainer}>
                <div className={`${styles.auraRing} ${styles.auraRingAmber}`} />
                <div className={`${styles.auraPulse} ${styles.auraPulseAmber}`} />
                <div className={styles.avatarCircle}>
                  <span className={styles.avatarText}>{top3.avatar}</span>
                </div>
                <div className={styles.crownBronze}>🥉</div>
              </div>

              <div className={styles.nicknameTagAmber}>
                <FontAwesomeIcon icon={faFire} />
                <span className={styles.nicknameText}>{top3.title || "Tiên Phong Bút Phá"}</span>
              </div>

              <h3 className={styles.studentName}>{top3.name}</h3>

              <div className={styles.podiumStats}>
                <div className={styles.statChip}>
                  <FontAwesomeIcon icon={faZap} className={styles.iconXp} />
                  <span className={styles.statChipText}>{top3.currentXp.toLocaleString("vi-VN")} XP</span>
                </div>
                <div className={styles.statChip}>
                  <FontAwesomeIcon icon={faFire} className={styles.iconStreak} />
                  <span className={styles.statChipText}>{top3.streak} Ngày</span>
                </div>
              </div>

              <p className={styles.mottoText}>"{top3.quote || "Nỗ lực mỗi ngày, vươn tầm ước mơ."}"</p>

              <button
                className={`${styles.likeBtn} ${likedUsers[top3.name] ? styles.liked : ""}`}
                onClick={() => toggleLike(top3.name)}
              >
                <FontAwesomeIcon icon={faHeart} />
                <span className={styles.btnLabelText}>
                  {likedUsers[top3.name] ? "Đã Khâm Phục" : "Khâm Phục (810)"}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. MAIN RANKING LIST (CLEAN ULTRA-MODERN CARD LIST) */}
      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2 className={styles.listSectionTitle}>
            Danh Sách Xếp Hạng <span className={styles.countTag}>({processedStudents.length} Học Viên)</span>
          </h2>
          <span className={styles.updateBadge}>
            <FontAwesomeIcon icon={faSyncAlt} className={styles.spinIcon} />
            <span className={styles.updateBadgeText}>Tự động cập nhật</span>
          </span>
        </div>

        {/* ULTRA-MODERN RANKING CARDS GROUP */}
        <div className={styles.rankingCardsContainer}>
          {processedStudents.map((student) => {
            const isTop3 = student.rank <= 3;
            const isSelf = student.isCurrentUser;
            const relativePercent = Math.min(
              100,
              Math.round((student.currentXp / maxXp) * 100)
            );

            return (
              <div
                key={student.name + student.rank}
                className={`${styles.modernRankCard} ${isTop3 ? styles.cardTop3 : ""} ${
                  isSelf ? styles.cardSelf : ""
                }`}
              >
                {/* 1. Rank Badge */}
                <div className={styles.cardRankCol}>
                  {student.rank === 1 && <span className={styles.rankGoldPill}>👑 #1</span>}
                  {student.rank === 2 && <span className={styles.rankSilverPill}>🥈 #2</span>}
                  {student.rank === 3 && <span className={styles.rankBronzePill}>🥉 #3</span>}
                  {student.rank === 4 && <span className={styles.rankEmeraldPill}>✨ #4</span>}
                  {student.rank === 5 && <span className={styles.rankCyanPill}>⭐ #5</span>}
                  {student.rank > 5 && (
                    <span className={styles.rankNormalPill}>#{student.rank}</span>
                  )}
                </div>

                {/* 2. Student Avatar & Name */}
                <div className={styles.cardStudentCol}>
                  <div className={styles.avatarWrapper}>
                    <span className={styles.avatarInitials}>{student.avatar}</span>
                    {isSelf && <div className={styles.selfPulseDot} />}
                  </div>
                  <div className={styles.studentInfoBox}>
                    <span className={styles.studentNameText}>
                      {student.name}
                      {isSelf && <span className={styles.youBadgeTag}>BẠN</span>}
                    </span>
                  </div>
                </div>

                {/* 3. Title / Nickname */}
                <div className={styles.cardNicknameCol}>
                  {student.title ? (
                    <span className={styles.nicknameBadgePill}>
                      {student.title}
                    </span>
                  ) : (
                    <span className={styles.defaultNicknameText}>
                      Học viên chăm chỉ
                    </span>
                  )}
                </div>

                {/* 4. Metric Chips (Streak & Lessons) */}
                <div className={styles.cardMetricsCol}>
                  <span className={styles.streakMetricPill}>
                    <FontAwesomeIcon icon={faFire} className={styles.flameIcon} />
                    <span className={styles.metricVal}>{student.streak}d</span>
                  </span>
                  <span className={styles.lessonsMetricPill}>
                    <FontAwesomeIcon icon={faBookOpen} className={styles.bookIcon} />
                    <span className={styles.metricVal}>{student.lessons} bài</span>
                  </span>
                </div>

                {/* 5. XP Score */}
                <div className={styles.cardXpCol}>
                  <span className={styles.xpBadgeBox}>
                    <FontAwesomeIcon icon={faZap} className={styles.zapIcon} />
                    <strong className={styles.xpValueText}>
                      {student.currentXp.toLocaleString("vi-VN")} XP
                    </strong>
                  </span>
                </div>

                {/* 6. Relative Progress Bar */}
                <div className={styles.cardProgressCol}>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFillBar}
                      style={{ width: `${relativePercent}%` }}
                    />
                  </div>
                  <span className={styles.progressNumText}>{relativePercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Leaderboard;
