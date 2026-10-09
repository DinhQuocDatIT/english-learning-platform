import React, { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faCrown,
  faMedal,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import StreakBadge from "../../../components/StreakBadge/StreakBadge";
import leaderboardService from "../../../services/leaderboardService";
import Loading from "../../../components/common/Loading/Loading";
import getImageUrl from "../../../utils/imageUrl";
import styles from "./Leaderboard.module.css";

const DEFAULT_AVATAR = "/uploads/avatars/default-avatar.png";

function Leaderboard() {
  const [top3, setTop3] = useState([]);
  const [others, setOthers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await leaderboardService.getLeaderboard(100);
      const data = res?.data?.data;

      setTop3(data?.top3 || []);
      setOthers(data?.others || []);
      setCurrentUser(data?.currentUser || null);
      setTotalParticipants(data?.totalParticipants || 0);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải bảng xếp hạng.");
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = (u) => getImageUrl(u?.avatar);

  const handleAvatarError = (e) => {
    e.target.src = getImageUrl(DEFAULT_AVATAR);
  };

  const allUsers = useMemo(() => {
    const list = [];
    if (top3[0]) list.push({ ...top3[0], rank: 1 });
    if (top3[1]) list.push({ ...top3[1], rank: 2 });
    if (top3[2]) list.push({ ...top3[2], rank: 3 });
    return [...list, ...others];
  }, [top3, others]);

  if (loading) {
    return <Loading size="large" text="Đang tải bảng xếp hạng..." />;
  }

  if (top3.length === 0 && others.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyBox}>
          <FontAwesomeIcon icon={faTrophy} className={styles.emptyIcon} />
          <p>Chưa có dữ liệu xếp hạng.</p>
        </div>
      </div>
    );
  }

  const top1 = top3[0];
  const top2 = top3[1];
  const top3Item = top3[2];

  return (
    <div className={styles.container}>
      {/* HERO */}
      <div className={styles.hero}>
        <span className={styles.heroBadge}>
          <FontAwesomeIcon icon={faTrophy} />
          Bảng xếp hạng
        </span>

        <h1 className={styles.heroTitle}>
          Bảng xếp hạng{" "}
          <span className={styles.heroHighlight}>học viên xuất sắc</span>
        </h1>

        <p className={styles.heroDesc}>
          Vinh danh những học viên có thành tích học tập tốt nhất và duy trì
          chuỗi học tập chăm chỉ.
        </p>

        {totalParticipants > 0 && (
          <p className={styles.heroMeta}>
            Đang có{" "}
            <strong className={styles.heroMetaNum}>
              {totalParticipants.toLocaleString("vi-VN")}
            </strong>{" "}
            học viên tham gia thi đua
          </p>
        )}
      </div>

      {/* PODIUM — TOP 3 */}
      <div className={styles.podium}>
        {/* TOP 2 */}
        {top2 && (
          <div
            className={`${styles.podiumCard} ${styles.rank2}`}
            style={{ "--card-color": "#f59e0b" }}
          >
            <div className={styles.podiumRank}>
              <FontAwesomeIcon icon={faMedal} />
              <span>2</span>
            </div>
            <div className={styles.podiumAvatarWrap}>
              <img
                src={avatarUrl(top2)}
                alt={top2.name}
                className={styles.podiumAvatar}
                onError={handleAvatarError}
              />
              <span className={styles.levelChip}>Cấp {top2.level}</span>
            </div>
            <h3 className={styles.podiumName} title={top2.name}>
              {top2.name}
            </h3>
            {top2.title && (
              <span className={styles.userSubTitle}>{top2.title}</span>
            )}
            <div className={styles.podiumStats}>
              <span className={styles.podiumStat}>
                <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
                <strong>{top2.exp.toLocaleString("vi-VN")}</strong>
                <span className={styles.expLabel}>exp</span>
              </span>
              <StreakBadge streak={top2.streak} />
            </div>
          </div>
        )}

        {/* TOP 1 */}
        {top1 && (
          <div
            className={`${styles.podiumCard} ${styles.rank1}`}
            style={{ "--card-color": "#0ea792" }}
          >
            <div className={styles.crownWrap}>
              <FontAwesomeIcon icon={faCrown} className={styles.crownIcon} />
            </div>
            <div className={styles.podiumRank}>
              <FontAwesomeIcon icon={faTrophy} />
              <span>1</span>
            </div>
            <div className={styles.podiumAvatarWrap}>
              <img
                src={avatarUrl(top1)}
                alt={top1.name}
                className={styles.podiumAvatar}
                onError={handleAvatarError}
              />
              <span className={`${styles.levelChip} ${styles.levelChipGold}`}>
                Cấp {top1.level}
              </span>
            </div>
            <h3 className={styles.podiumName} title={top1.name}>
              {top1.name}
            </h3>
            {top1.title && (
              <span className={styles.userSubTitleGold}>{top1.title}</span>
            )}
            <div className={styles.podiumStats}>
              <span className={`${styles.podiumStat} ${styles.statGold}`}>
                <FontAwesomeIcon
                  icon={faStar}
                  className={styles.starIconGold}
                />
                <strong>{top1.exp.toLocaleString("vi-VN")}</strong>
                <span className={styles.expLabel}>exp</span>
              </span>
              <StreakBadge streak={top1.streak} />
            </div>
          </div>
        )}

        {/* TOP 3 */}
        {top3Item && (
          <div
            className={`${styles.podiumCard} ${styles.rank3}`}
            style={{ "--card-color": "#dc2626" }}
          >
            <div className={styles.podiumRank}>
              <FontAwesomeIcon icon={faMedal} />
              <span>3</span>
            </div>
            <div className={styles.podiumAvatarWrap}>
              <img
                src={avatarUrl(top3Item)}
                alt={top3Item.name}
                className={styles.podiumAvatar}
                onError={handleAvatarError}
              />
              <span className={styles.levelChip}>Cấp {top3Item.level}</span>
            </div>
            <h3 className={styles.podiumName} title={top3Item.name}>
              {top3Item.name}
            </h3>
            {top3Item.title && (
              <span className={styles.userSubTitle}>{top3Item.title}</span>
            )}
            <div className={styles.podiumStats}>
              <span className={styles.podiumStat}>
                <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
                <strong>{top3Item.exp.toLocaleString("vi-VN")}</strong>
                <span className={styles.expLabel}>exp</span>
              </span>
              <StreakBadge streak={top3Item.streak} />
            </div>
          </div>
        )}
      </div>

      {/* LEADERBOARD LIST */}
      {allUsers.length > 0 && (
        <div className={styles.listSection}>
          <h2 className={styles.listTitleFull}>
            Bảng xếp hạng Top {allUsers.length} học viên
          </h2>

          <div className={styles.listHeader}>
            <span className={styles.colRank}>Hạng</span>
            <span className={styles.colUser}>Học viên</span>
            <span className={styles.colExp}>Kinh nghiệm</span>
            <span className={styles.colStreak}>Chuỗi học</span>
          </div>

          <div className={styles.list}>
            {allUsers.map((user) => {
              const isRank1 = user.rank === 1;
              const isRank2 = user.rank === 2;
              const isRank3 = user.rank === 3;

              let rowClass = styles.listRow;
              if (isRank1) rowClass += ` ${styles.rank1ListRow}`;
              else if (isRank2) rowClass += ` ${styles.rank2ListRow}`;
              else if (isRank3) rowClass += ` ${styles.rank3ListRow}`;
              if (user.isCurrentUser) rowClass += ` ${styles.currentUserRow}`;

              return (
                <div key={user.studentId || user.rank} className={rowClass}>
                  <div className={styles.colRank}>
                    {isRank1 ? (
                      <span
                        className={`${styles.rankNumber} ${styles.rank1RowPill}`}
                      >
                        🥇 #1
                      </span>
                    ) : isRank2 ? (
                      <span
                        className={`${styles.rankNumber} ${styles.rank2RowPill}`}
                      >
                        🥈 #2
                      </span>
                    ) : isRank3 ? (
                      <span
                        className={`${styles.rankNumber} ${styles.rank3RowPill}`}
                      >
                        🥉 #3
                      </span>
                    ) : (
                      <span className={styles.rankNumber}>#{user.rank}</span>
                    )}
                  </div>

                  <div className={styles.colUser}>
                    <img
                      src={avatarUrl(user)}
                      alt={user.name}
                      className={styles.rowAvatar}
                      onError={handleAvatarError}
                    />
                    <div className={styles.rowUserInfo}>
                      <span className={styles.rowName} title={user.name}>
                        {user.name}
                        {user.isCurrentUser && (
                          <span className={styles.youTag}> (Bạn)</span>
                        )}
                      </span>
                      <span className={styles.rowLevel}>
                        Cấp độ {user.level}{" "}
                        {user.title ? `· ${user.title}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className={styles.colExp}>
                    <FontAwesomeIcon
                      icon={faStar}
                      className={styles.starIconRow}
                    />
                    <strong>{user.exp.toLocaleString("vi-VN")}</strong> exp
                  </div>

                  <div className={styles.colStreak}>
                    <StreakBadge streak={user.streak} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
