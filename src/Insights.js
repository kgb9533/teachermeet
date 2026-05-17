// src/Insights.js
// 프로필 통계 인사이트 컴포넌트 - 홈 화면에 들어감
// - 호감도 (상위 N%)
// - 이번 주 좋아요 받은 수
// - 프로필 조회수
// - 인기 시간대
// - 매칭 변환율

import React, { useState, useEffect } from 'react';
import { calculateInsights } from './stats';

export default function Insights({ user }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await calculateInsights(user.uid);
      setInsights(data);
      setLoading(false);
    };
    load();
  }, [user.uid]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>📊 나의 인사이트</div>
        </div>
        <div style={styles.loadingBox}>
          <div style={styles.loadingText}>분석 중...</div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  // 호감도 메시지 만들기
  const getPercentileMsg = (pct) => {
    if (pct <= 5) return { emoji: '🔥', text: '핫한 인기', color: '#E8603A' };
    if (pct <= 20) return { emoji: '⭐', text: '높은 인기', color: '#F4845F' };
    if (pct <= 50) return { emoji: '😊', text: '평균 이상', color: '#FDBCAA' };
    return { emoji: '🌱', text: '시작 단계', color: '#9C5A4A' };
  };

  const popularity = getPercentileMsg(insights.percentile);

  // 인기 시간대 추천 메시지
  const getPeakHourTip = () => {
    if (insights.peakHour === -1) return '활동 데이터를 더 모아보세요!';
    const hour = insights.peakHour;
    if (hour >= 18 && hour < 23) return '저녁 시간이 골든 타임이에요 ✨';
    if (hour >= 9 && hour < 12) return '오전이 활발한 시간이네요 ☀️';
    if (hour >= 12 && hour < 18) return '오후가 가장 활발한 시간이에요 🌤️';
    return '심야 시간에 인기가 많네요 🌙';
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div onClick={() => setExpanded(!expanded)} style={styles.header}>
        <div style={styles.title}>📊 나의 인사이트</div>
        <div style={styles.expandBtn}>{expanded ? '간략히' : '자세히'} {expanded ? '▲' : '▼'}</div>
      </div>

      {/* 핵심 카드: 호감도 (큰 카드) */}
      <div style={{ ...styles.heroCard, background: `linear-gradient(135deg, ${popularity.color}, #E8603A)` }}>
        <div style={styles.heroLeft}>
          <div style={styles.heroEmoji}>{popularity.emoji}</div>
        </div>
        <div style={styles.heroCenter}>
          <div style={styles.heroLabel}>나의 호감도</div>
          <div style={styles.heroValue}>상위 {insights.percentile}%</div>
          <div style={styles.heroSubLabel}>{popularity.text}</div>
        </div>
        <div style={styles.heroRight}>
          <div style={styles.heroBadge}>
            {insights.totalLikesReceived}
            <div style={styles.heroBadgeLabel}>총 좋아요</div>
          </div>
        </div>
      </div>

      {/* 통계 그리드 */}
      <div style={styles.statsGrid}>
        {/* 이번 주 좋아요 */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💕</div>
          <div style={styles.statValue}>{insights.weeklyLikes}</div>
          <div style={styles.statLabel}>이번 주 좋아요</div>
        </div>

        {/* 프로필 조회수 */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👀</div>
          <div style={styles.statValue}>{insights.weeklyViews}</div>
          <div style={styles.statLabel}>이번 주 조회수</div>
        </div>

        {/* 누적 매칭 */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎉</div>
          <div style={styles.statValue}>{insights.totalMatches}</div>
          <div style={styles.statLabel}>누적 매칭</div>
        </div>

        {/* 매칭 변환율 */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⚡</div>
          <div style={styles.statValue}>{insights.matchRate}%</div>
          <div style={styles.statLabel}>매칭률</div>
        </div>
      </div>

      {/* 자세히 보기 - 인기 시간대 */}
      {expanded && (
        <>
          <div style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <span style={styles.detailIcon}>⏰</span>
              <span style={styles.detailTitle}>인기 시간대</span>
            </div>
            <div style={styles.detailValue}>{insights.peakHourLabel}</div>
            <div style={styles.detailHint}>{getPeakHourTip()}</div>

            {/* 시간대 막대 그래프 (간단 버전) */}
            {insights.peakHour !== -1 && (
              <div style={styles.barChart}>
                {[0, 6, 12, 18].map((startHour) => {
                  const slotCount = insights.hourBuckets
                    .slice(startHour, startHour + 6)
                    .reduce((sum, c) => sum + c, 0);
                  const maxSlot = Math.max(
                    ...[0, 6, 12, 18].map(h =>
                      insights.hourBuckets.slice(h, h + 6).reduce((s, c) => s + c, 0)
                    )
                  );
                  const height = maxSlot > 0 ? (slotCount / maxSlot) * 100 : 0;
                  const labels = ['새벽', '오전', '오후', '저녁'];
                  const isActive = insights.peakHour >= startHour && insights.peakHour < startHour + 6;
                  return (
                    <div key={startHour} style={styles.barColumn}>
                      <div style={styles.barWrapper}>
                        <div
                          style={{
                            ...styles.bar,
                            height: `${Math.max(height, 5)}%`,
                            background: isActive ? '#E8603A' : '#FDBCAA',
                          }}
                        />
                      </div>
                      <div style={styles.barLabel}>{labels[startHour / 6]}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <span style={styles.detailIcon}>💡</span>
              <span style={styles.detailTitle}>활동 요약</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>내가 누른 좋아요</span>
              <span style={styles.summaryValue}>{insights.totalLikesGiven}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>받은 좋아요</span>
              <span style={styles.summaryValue}>{insights.totalLikesReceived}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>매칭 성공</span>
              <span style={styles.summaryValue}>{insights.totalMatches}</span>
            </div>
            <div style={styles.tipBox}>
              💪 더 많은 매칭을 위한 팁: 다양한 사진 + 자세한 자기소개 작성!
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Nunito, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    cursor: 'pointer',
  },
  title: {
    fontSize: 13,
    fontWeight: 800,
    color: '#3D1008',
  },
  expandBtn: {
    fontSize: 11,
    fontWeight: 700,
    color: '#F4845F',
    background: '#FFF0EB',
    padding: '4px 10px',
    borderRadius: 10,
  },
  loadingBox: {
    background: 'white',
    border: '1.5px solid #FDBCAA',
    borderRadius: 14,
    padding: '24px',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#FDBCAA',
    fontWeight: 600,
  },
  heroCard: {
    borderRadius: 16,
    padding: 16,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    boxShadow: '0 4px 16px rgba(232,96,58,0.25)',
  },
  heroLeft: {
    flexShrink: 0,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroCenter: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 10,
    opacity: 0.9,
    fontWeight: 600,
    marginBottom: 2,
  },
  heroValue: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  heroSubLabel: {
    fontSize: 11,
    opacity: 0.95,
    fontWeight: 700,
    marginTop: 2,
  },
  heroRight: {
    flexShrink: 0,
  },
  heroBadge: {
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(8px)',
    borderRadius: 12,
    padding: '8px 12px',
    fontSize: 20,
    fontWeight: 800,
    textAlign: 'center',
    minWidth: 50,
  },
  heroBadgeLabel: {
    fontSize: 9,
    fontWeight: 600,
    opacity: 0.9,
    marginTop: 2,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
  },
  statCard: {
    background: 'white',
    border: '1.5px solid #FDBCAA',
    borderRadius: 12,
    padding: '10px 6px',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 800,
    color: '#F4845F',
  },
  statLabel: {
    fontSize: 9,
    color: '#FDBCAA',
    fontWeight: 600,
    marginTop: 2,
  },
  detailCard: {
    background: 'white',
    border: '1.5px solid #FDBCAA',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: '#3D1008',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 800,
    color: '#E8603A',
    marginBottom: 4,
  },
  detailHint: {
    fontSize: 11,
    color: '#9C5A4A',
    fontWeight: 600,
    marginBottom: 12,
  },
  barChart: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    background: '#FFFAF8',
    borderRadius: 10,
    padding: '8px 4px 4px',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: '6px 6px 2px 2px',
    transition: 'all 0.3s ease',
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#9C5A4A',
    fontWeight: 700,
    marginTop: 4,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #FFF0EB',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9C5A4A',
    fontWeight: 600,
  },
  summaryValue: {
    fontSize: 13,
    color: '#E8603A',
    fontWeight: 800,
  },
  tipBox: {
    background: '#FFF0EB',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 11,
    color: '#C23B22',
    fontWeight: 700,
    marginTop: 12,
    lineHeight: 1.5,
  },
};