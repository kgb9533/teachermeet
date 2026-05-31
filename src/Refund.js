// src/Refund.js
import React from 'react';
import { BUSINESS_INFO } from './Footer';

export default function Refund({ onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>환불정책</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          <strong>{BUSINESS_INFO.companyName}</strong>는 「전자상거래 등에서의 소비자보호에 관한 법률」 및
          「소비자분쟁해결기준」(공정거래위원회 고시)을 준수하여 다음과 같이 환불정책을 운영합니다.
        </p>
        <p style={styles.meta}>시행일: 2026년 5월 14일</p>

        <h3 style={styles.h3}>1. 청약철회 및 전액 환불</h3>
        <div style={styles.box}>
          <p>다음 조건을 모두 충족하는 경우 회원은 전액 환불을 요청할 수 있습니다.</p>
          <ul style={styles.ul}>
            <li>EDU 결제일로부터 <strong>7일 이내</strong></li>
            <li>충전한 EDU를 한 번도 사용하지 않은 경우</li>
          </ul>
        </div>

        <h3 style={styles.h3}>2. 부분 사용 후 환불 (잔여 EDU 환불)</h3>
        <p>회원이 충전한 EDU의 일부를 사용한 경우, 다음 기준에 따라 잔여 EDU에 한해 환불이 가능합니다.</p>
        <div style={styles.box}>
          <p><strong>환불 금액 = (잔여 EDU / 충전 EDU) × 결제 금액 − 환불 수수료</strong></p>
          <p style={styles.example}>
            예시) 10,000원으로 1,000 EDU를 충전 후 300 EDU 사용 → 잔여 700 EDU<br />
            환불 가능액 = (700 / 1,000) × 10,000원 − 수수료 = 약 7,000원 (수수료 차감 전)
          </p>
        </div>

        <h3 style={styles.h3}>3. 환불 수수료</h3>
        <ul style={styles.ul}>
          <li><strong>7일 이내 미사용 청약철회(제1조)</strong>: 「전자상거래 등에서의 소비자보호에 관한 법률」 제18조에 따라 <strong>수수료 차감 없이 결제 금액 전액</strong>을 동일한 결제수단으로 환불해 드립니다.</li>
          <li><strong>부분 사용 후 환불(제2조)</strong>: 잔여 EDU에 한해 비례 환불하되, 잔여 EDU 환산 금액의 <strong>10%</strong> 또는 1,000원 중 큰 금액을 위약금으로 차감합니다.</li>
          <li>위 위약금은 회원의 단순 변심에 의한 부분환불에 한하며, 회사의 귀책사유로 인한 환불(제6조)에는 적용되지 않습니다.</li>
        </ul>

        <h3 style={styles.h3}>4. 환불이 제한되는 경우</h3>
        <p>다음의 경우 환불이 제한되거나 거절될 수 있습니다.</p>
        <ul style={styles.ul}>
          <li>이벤트·프로모션을 통해 무상으로 지급된 EDU</li>
          <li>회원이 약관 위반으로 영구이용정지 처분을 받은 경우 (제재 사유의 잔여 EDU)</li>
          <li>부정한 방법으로 충전·취득한 EDU</li>
          <li>유효기간(충전일로부터 5년)이 경과하여 자동 소멸된 EDU</li>
          <li>타인에게 양도·매매된 사실이 확인된 EDU</li>
        </ul>

        <h3 style={styles.h3}>5. 환불 신청 방법</h3>
        <ol style={styles.ol}>
          <li>이메일 신청: <strong>{BUSINESS_INFO.email}</strong>로 아래 정보 전송
            <ul style={styles.ul}>
              <li>회원 가입 이메일</li>
              <li>결제일자 및 결제 금액</li>
              <li>환불 사유</li>
            </ul>
          </li>
          <li>접수 후 회사는 영업일 기준 <strong>3~5일 이내</strong> 검토하여 결과를 회신합니다.</li>
          <li>환불 승인 시 결제하신 동일한 결제수단으로 환불 처리되며, 카드 환불의 경우 카드사 정책에 따라 영업일 기준 추가 3~7일이 소요될 수 있습니다.</li>
        </ol>

        <h3 style={styles.h3}>6. 서비스 장애 시 환불</h3>
        <p>회사의 귀책사유로 인해 서비스 이용이 불가능했던 경우, 회원은 다음과 같이 보상받을 수 있습니다.</p>
        <ul style={styles.ul}>
          <li>장애 시간이 4시간 이상 지속된 경우: 장애 시간에 비례한 EDU 보상</li>
          <li>1개월 누적 장애 시간이 72시간을 초과한 경우: 해당 월 충전한 EDU 환불 가능</li>
        </ul>

        <h3 style={styles.h3}>7. 회원 탈퇴 시 EDU 처리</h3>
        <p>회원이 자발적으로 탈퇴하는 경우, 잔여 EDU는 본 정책 제1조·제2조의 환불 사유에 해당하지 않는 한 환불되지 않으며, 탈퇴와 동시에 소멸됩니다. 환불을 원하는 경우 탈퇴 전에 환불 신청을 완료하시기 바랍니다.</p>

        <h3 style={styles.h3}>8. 소비자 피해 보상 및 분쟁 해결</h3>
        <p>회사와 회원 간 분쟁이 발생하여 협의로 해결되지 않을 경우, 회원은 다음 기관에 분쟁 조정을 신청할 수 있습니다.</p>
        <ul style={styles.ul}>
          <li>한국소비자원 (kca.go.kr / 1372)</li>
          <li>전자거래분쟁조정위원회 (ecmc.or.kr / 1661-5714)</li>
          <li>공정거래위원회 (ftc.go.kr / 1670-0007)</li>
        </ul>

        <p style={styles.footer}>
          시행일: 2026년 5월 14일<br />
          {BUSINESS_INFO.companyName} | 문의: {BUSINESS_INFO.email}
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
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    color: '#3D1008',
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
  ul: {
    paddingLeft: 20,
    margin: '8px 0',
  },
  ol: {
    paddingLeft: 20,
    margin: '8px 0',
  },
  box: {
    background: '#fff',
    border: '1px solid #FDBCAA',
    borderRadius: 10,
    padding: 14,
    margin: '10px 0',
  },
  example: {
    fontSize: 13,
    color: '#9C5A4A',
    marginTop: 8,
    padding: 10,
    background: '#FFF0EB',
    borderRadius: 8,
    lineHeight: 1.6,
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