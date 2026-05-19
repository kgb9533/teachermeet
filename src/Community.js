// src/Community.js
import React from 'react';
import { BUSINESS_INFO } from './Footer';

export default function Community({ onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>커뮤니티 운영정책</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          <strong>{BUSINESS_INFO.companyName}</strong>은 모든 회원이 신뢰할 수 있고 안전한 환경에서 만남을 시작할 수 있도록
          다음과 같이 커뮤니티 운영정책을 수립·운영합니다. 본 정책은 「이용약관」과 함께 적용됩니다.
        </p>
        <p style={styles.meta}>시행일: 2026년 5월 14일</p>

        <h3 style={styles.h3}>1. 운영정책의 목적</h3>
        <p>본 정책은 회원 상호 간의 존중과 신뢰를 바탕으로 건전한 만남 문화를 조성하고, 부적절한 행위로부터 회원을 보호하기 위해 마련되었습니다.</p>

        <h3 style={styles.h3}>2. 금지 행위 (신고 사유 8가지)</h3>
        <p>아래 행위는 본 정책에 의해 금지되며, 신고 시 즉시 제재 대상이 됩니다.</p>
        <div style={styles.box}>
          <ol style={styles.ol}>
            <li><strong>스팸·광고:</strong> 상업적 홍보, 외부 사이트 유도, 다단계, 종교·정치 권유</li>
            <li><strong>욕설·비방:</strong> 욕설, 모욕적 표현, 인격 모독, 외모·직업·지역 비하</li>
            <li><strong>성희롱·음란:</strong> 성적 발언·요구, 음란물 전송, 신체 사진 요구</li>
            <li><strong>사기·금전 요구:</strong> 금품·계좌·코인 요구, 투자 권유, 보이스피싱</li>
            <li><strong>허위 정보·사칭:</strong> 가짜 프로필, 타인 사진 도용, 직업·나이 위조</li>
            <li><strong>미성년자 의심:</strong> 만 19세 미만으로 의심되는 정황 (우회 가입 의심 포함)</li>
            <li><strong>폭력·위협:</strong> 협박, 스토킹, 신변 위협, 만남 강요</li>
            <li><strong>기타 부적절한 행위:</strong> 그 외 회원에게 불쾌감을 주거나 서비스 운영을 방해하는 행위</li>
          </ol>
        </div>

        <h3 style={styles.h3}>3. 신고 처리 절차</h3>
        <ol style={styles.ol}>
          <li><strong>접수:</strong> 회원이 프로필 또는 채팅 화면에서 신고하기 → 사유 선택 → 상세 내용 작성</li>
          <li><strong>검토:</strong> 운영팀이 신고 내용 및 관련 대화·콘텐츠를 영업일 기준 24~72시간 이내 검토</li>
          <li><strong>조치:</strong> 위반 사실 확인 시 아래 "제재 기준"에 따라 조치 시행</li>
          <li><strong>결과 통보:</strong> 신고자·피신고자 양측에 조치 결과를 간략히 안내 (단, 신고자 정보는 비공개)</li>
        </ol>

        <h3 style={styles.h3}>4. 제재 기준</h3>
        <p>위반 행위의 경중 및 반복 여부에 따라 다음과 같이 단계적으로 제재합니다.</p>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>단계</th>
              <th style={styles.th}>조치</th>
              <th style={styles.th}>대상</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.tr}>
              <td style={styles.td}>1단계</td>
              <td style={styles.td}>경고 알림 + 콘텐츠 삭제</td>
              <td style={styles.td}>경미한 1회 위반</td>
            </tr>
            <tr style={styles.tr}>
              <td style={styles.td}>2단계</td>
              <td style={styles.td}>3일 이용 정지</td>
              <td style={styles.td}>경고 후 재발 / 반복적 부적절 언행</td>
            </tr>
            <tr style={styles.tr}>
              <td style={styles.td}>3단계</td>
              <td style={styles.td}>7~30일 이용 정지</td>
              <td style={styles.td}>다수 신고 누적 / 중대 위반</td>
            </tr>
            <tr style={styles.tr}>
              <td style={styles.td}>4단계</td>
              <td style={styles.td}>영구 이용 정지 + 강제 탈퇴</td>
              <td style={styles.td}>중대 위반 (아래 항목)</td>
            </tr>
          </tbody>
        </table>

        <h3 style={styles.h3}>5. 즉시 영구정지 사유</h3>
        <p>다음 행위는 단 한 번이라도 적발될 경우 즉시 영구 이용정지 및 강제 탈퇴 처리됩니다.</p>
        <div style={styles.warningBox}>
          <ul style={styles.ul}>
            <li>미성년자 의심 회원에 대한 부적절한 접근</li>
            <li>성매매·성폭력·아동 음란물 관련 행위</li>
            <li>금전 사기, 보이스피싱, 투자 사기</li>
            <li>타인의 신분 도용을 통한 가입 (CI/DI 위조 등)</li>
            <li>교원 자격증·재직증명서 위·변조</li>
            <li>다른 회원에 대한 협박, 신변 위협, 스토킹</li>
            <li>음란물 전송 및 게시</li>
            <li>회사의 서비스 운영을 의도적으로 방해하는 행위 (어뷰징, 해킹 시도 등)</li>
          </ul>
        </div>

        <h3 style={styles.h3}>6. 차단 기능</h3>
        <ol style={styles.ol}>
          <li>회원은 다른 회원을 언제든지 차단할 수 있으며, 차단 시 다음과 같이 처리됩니다.
            <ul style={styles.ul}>
              <li>스와이프(매칭 추천)에 노출되지 않음</li>
              <li>좋아요/추천 목록에서 자동 필터링</li>
              <li>매칭 목록 및 채팅 자동 숨김</li>
              <li>상대방에게 차단 사실은 알려지지 않음</li>
            </ul>
          </li>
          <li>차단한 회원은 "내 프로필 → 차단한 사람 관리"에서 언제든지 해제할 수 있습니다.</li>
        </ol>

        <h3 style={styles.h3}>7. 이의신청</h3>
        <ol style={styles.ol}>
          <li>제재 조치에 이의가 있는 회원은 조치 통보일로부터 <strong>14일 이내</strong> {BUSINESS_INFO.email}로 이의신청을 할 수 있습니다.</li>
          <li>이의신청 시 다음 정보를 함께 제출해주세요.
            <ul style={styles.ul}>
              <li>회원 가입 시 사용한 휴대폰 번호 또는 이메일</li>
              <li>제재 조치 일자</li>
              <li>이의신청 사유 및 입증 자료(있는 경우)</li>
            </ul>
          </li>
          <li>운영팀은 접수일로부터 영업일 기준 7일 이내 검토 결과를 회신합니다.</li>
          <li>검토 결과 제재가 부당했다고 판단되는 경우, 즉시 조치를 해제하고 영향받은 EDU·매칭 정보를 복원합니다.</li>
        </ol>

        <h3 style={styles.h3}>8. 허위·악의적 신고에 대한 조치</h3>
        <p>특정 회원을 괴롭히거나 부당한 이익을 얻기 위한 허위 신고가 확인될 경우, 신고자에게도 본 정책에 따른 제재가 적용될 수 있습니다.</p>

        <h3 style={styles.h3}>9. 회원에 대한 권고</h3>
        <p>안전하고 즐거운 서비스 이용을 위해 다음 사항을 권고합니다.</p>
        <ul style={styles.ul}>
          <li>실제 만남 전에는 충분한 대화를 통해 상대를 파악해주세요.</li>
          <li>첫 만남은 공공장소에서 가지시고, 가족·지인에게 일정을 공유해주세요.</li>
          <li>금전을 요구하거나 의심스러운 링크를 보내는 회원은 즉시 신고해주세요.</li>
          <li>개인정보(주소, 직장 상세 위치, 계좌 등)는 신중하게 공유해주세요.</li>
        </ul>

        <h3 style={styles.h3}>10. 정책의 변경</h3>
        <p>본 정책은 법령 또는 서비스 운영 정책의 변경에 따라 개정될 수 있으며, 변경 시 시행일 7일 전(중대한 변경은 30일 전)에 공지합니다.</p>

        <p style={styles.footer}>
          시행일: 2026년 5월 14일<br />
          {BUSINESS_INFO.companyName} | 신고·문의: {BUSINESS_INFO.email}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFF8F5',
    fontFamily: 'Nunito, sans-serif',
    color: '#3D1008',
    paddingBottom: 80,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #FDBCAA',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  content: {
    padding: '20px 18px',
    fontSize: 14,
    lineHeight: 1.7,
  },
  intro: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#9C5A4A',
    marginBottom: 24,
  },
  h3: {
    fontSize: 15,
    color: '#C23B22',
    marginTop: 28,
    marginBottom: 8,
  },
  ol: {
    paddingLeft: 20,
    margin: '8px 0',
  },
  ul: {
    paddingLeft: 20,
    margin: '6px 0',
  },
  box: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    border: '1.5px solid #FDBCAA',
    margin: '10px 0',
  },
  warningBox: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    border: '1.5px solid #C23B22',
    margin: '10px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '10px 0',
    fontSize: 13,
  },
  tr: {
    borderBottom: '1px solid #FDBCAA',
  },
  th: {
    textAlign: 'left',
    padding: 8,
    background: '#FFF0EB',
    color: '#C23B22',
  },
  td: {
    padding: 8,
    verticalAlign: 'top',
  },
  footer: {
    marginTop: 40,
    padding: 14,
    background: '#FFF0EB',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 13,
  },
};