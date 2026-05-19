// src/LocationTerms.js
import React from 'react';
import { BUSINESS_INFO } from './Footer';

export default function LocationTerms({ onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>위치기반서비스 이용약관</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          본 약관은 <strong>{BUSINESS_INFO.companyName}</strong>(이하 "회사")가 제공하는 위치기반 서비스에 대해
          회사와 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
        <p style={styles.meta}>시행일: 2026년 5월 14일</p>

        <h3 style={styles.h3}>제1조 (목적)</h3>
        <p>본 약관은 회사가 제공하는 위치기반 서비스(이하 "위치서비스")의 이용과 관련하여 회사와 위치정보주체(회원) 간의 권리·의무 및 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

        <h3 style={styles.h3}>제2조 (용어의 정의)</h3>
        <ol style={styles.ol}>
          <li>"개인위치정보"란 특정 개인의 위치정보(위치정보만으로는 특정 개인의 위치를 알 수 없는 경우에도 다른 정보와 용이하게 결합하여 특정 개인의 위치정보를 알 수 있는 것을 포함한다)를 말합니다.</li>
          <li>"위치기반서비스"란 개인위치정보를 이용하여 제공하는 서비스를 말합니다.</li>
          <li>"위치정보주체"란 개인위치정보에 의하여 식별되는 자를 말합니다.</li>
        </ol>

        <h3 style={styles.h3}>제3조 (이용약관의 효력 및 변경)</h3>
        <ol style={styles.ol}>
          <li>본 약관은 회원이 약관에 동의한 후 회사가 정한 절차에 따라 위치기반서비스 이용 신청을 하고 회사가 이를 승낙함으로써 효력이 발생합니다.</li>
          <li>회원이 온라인에서 본 약관의 "동의" 버튼을 클릭하였을 경우 본 약관의 내용을 충분히 이해하고 그 적용에 동의한 것으로 봅니다.</li>
          <li>회사는 「위치정보의 보호 및 이용 등에 관한 법률」, 「콘텐츠산업진흥법」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
        </ol>

        <h3 style={styles.h3}>제4조 (서비스의 내용 및 요금)</h3>
        <p>회사는 회원의 개인위치정보를 이용하여 아래의 위치기반서비스를 제공합니다.</p>
        <ul style={styles.ul}>
          <li><strong>지역 기반 매칭 추천:</strong> 회원의 현재 위치 또는 등록된 지역 정보를 활용하여 인근 지역 회원을 우선 추천</li>
          <li><strong>거리 표시:</strong> 매칭 상대와의 대략적인 거리 정보 제공</li>
          <li><strong>지역 통계:</strong> 회원이 선택한 지역에서의 활동 회원 수 등 통계 정보 제공</li>
        </ul>
        <p style={{ marginTop: 10 }}>위치기반서비스 이용은 무료이며, 다만 이용 시 발생하는 데이터 통신 요금은 회원이 가입한 통신사 정책에 따라 별도 부과될 수 있습니다.</p>

        <h3 style={styles.h3}>제5조 (개인위치정보주체의 권리)</h3>
        <ol style={styles.ol}>
          <li>회원은 언제든지 개인위치정보의 수집·이용·제공에 대한 동의의 전부 또는 일부를 철회할 수 있습니다.</li>
          <li>회원은 언제든지 개인위치정보의 수집·이용·제공의 일시적인 중지를 요구할 수 있으며, 회사는 이를 거절할 수 없고 이를 위한 기술적 수단을 갖추고 있습니다.</li>
          <li>회원은 회사에 대하여 아래 자료의 열람 또는 고지를 요구할 수 있고, 해당 자료에 오류가 있는 경우에는 그 정정을 요구할 수 있습니다. 회사는 정당한 사유 없이 회원의 요구를 거절하지 아니합니다.
            <ul style={styles.ul}>
              <li>본인에 대한 위치정보 수집·이용·제공사실 확인자료</li>
              <li>본인의 개인위치정보가 본 약관에 명시된 범위를 넘어 이용되거나 제3자에게 제공된 이유 및 내용</li>
            </ul>
          </li>
          <li>회원은 권리 행사를 위해 회사의 고객센터({BUSINESS_INFO.cpoEmail})로 요청할 수 있으며, 회사는 정당한 사유가 없는 한 지체 없이 필요한 조치를 취합니다.</li>
        </ol>

        <h3 style={styles.h3}>제6조 (법정대리인의 권리)</h3>
        <p>본 서비스는 만 19세 이상의 성인만 이용 가능하므로, 만 14세 미만 아동의 법정대리인 동의 절차를 별도로 두지 않습니다. 만약 만 14세 미만 아동이 우회 가입한 사실이 확인되는 경우 즉시 강제 탈퇴 및 개인위치정보 파기 조치를 취합니다.</p>

        <h3 style={styles.h3}>제7조 (개인위치정보의 이용·제공)</h3>
        <ol style={styles.ol}>
          <li>회사는 개인위치정보를 이용하여 위치기반서비스를 제공하는 경우 본 약관에 명시한 후 동의를 받습니다.</li>
          <li>회사는 회원의 사전 동의 없이 개인위치정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.
            <ul style={styles.ul}>
              <li>위치정보 및 위치기반서비스 등의 제공에 관한 계약 이행을 위해 필요한 경우</li>
              <li>「위치정보의 보호 및 이용 등에 관한 법률」 제29조의 규정에 따른 긴급구조기관(소방청, 해양경찰청, 경찰청)의 요청이 있는 경우</li>
              <li>법령에 따라 제출 의무가 있는 경우</li>
            </ul>
          </li>
        </ol>

        <h3 style={styles.h3}>제8조 (개인위치정보의 보유기간 및 파기)</h3>
        <ol style={styles.ol}>
          <li>회사는 위치기반서비스 제공을 위해 필요한 최소한의 기간 동안 개인위치정보를 보유합니다.</li>
          <li>회원이 위치기반서비스 이용 동의를 철회하거나 회원 탈퇴 시 개인위치정보는 즉시 파기됩니다.</li>
          <li>「위치정보의 보호 및 이용 등에 관한 법률」 제16조 제2항에 의거 회사는 개인위치정보의 수집·이용·제공사실 확인자료를 위치정보시스템에 자동으로 기록되며 <strong>최소 6개월 이상</strong> 보관합니다.</li>
        </ol>

        <h3 style={styles.h3}>제9조 (서비스의 변경 및 중지)</h3>
        <ol style={styles.ol}>
          <li>회사는 위치정보사업자의 정책 변경, 천재지변, 전시·사변, 국가비상사태 등 회사의 제반 사정 또는 법률상의 장애 등 부득이한 사유로 위치기반서비스의 전부 또는 일부를 제한·중지할 수 있습니다.</li>
          <li>위 사항이 발생한 경우 회사는 회원에게 사전 또는 사후 공지합니다.</li>
        </ol>

        <h3 style={styles.h3}>제10조 (손해배상)</h3>
        <p>회원이 본 약관의 규정을 위반함으로 인하여 회사에 손해가 발생한 경우 회사에 손해를 배상하여야 하며, 회사가 본 약관에서 정한 의무를 위반하여 회원에게 손해가 발생한 경우 회원은 회사로부터 손해배상을 받을 수 있습니다.</p>

        <h3 style={styles.h3}>제11조 (분쟁의 조정 및 기타)</h3>
        <ol style={styles.ol}>
          <li>회사와 회원 간 위치기반서비스 이용에 관한 분쟁이 발생한 경우, 양 당사자 간의 협의에 의해 해결합니다.</li>
          <li>협의가 이루어지지 아니할 경우, 양 당사자는 「위치정보의 보호 및 이용 등에 관한 법률」 제28조의 규정에 의한 방송통신위원회에 재정을 신청하거나, 「개인정보 보호법」 제40조의 규정에 의한 개인정보분쟁조정위원회에 분쟁의 조정을 신청할 수 있습니다.</li>
        </ol>

        <h3 style={styles.h3}>제12조 (회사의 연락처)</h3>
        <div style={styles.cpoBox}>
          <p style={{ margin: '4px 0' }}><strong>상호:</strong> {BUSINESS_INFO.companyName}</p>
          <p style={{ margin: '4px 0' }}><strong>대표자:</strong> {BUSINESS_INFO.representativeName}</p>
          <p style={{ margin: '4px 0' }}><strong>주소:</strong> {BUSINESS_INFO.address}</p>
          <p style={{ margin: '4px 0' }}><strong>전화:</strong> {BUSINESS_INFO.phone}</p>
          <p style={{ margin: '4px 0' }}><strong>이메일:</strong> {BUSINESS_INFO.email}</p>
        </div>

        <h3 style={styles.h3}>제13조 (위치정보관리책임자)</h3>
        <div style={styles.cpoBox}>
          <p style={{ margin: '4px 0' }}><strong>책임자:</strong> {BUSINESS_INFO.cpoName}</p>
          <p style={{ margin: '4px 0' }}><strong>이메일:</strong> {BUSINESS_INFO.cpoEmail}</p>
          <p style={{ margin: '4px 0' }}><strong>전화:</strong> {BUSINESS_INFO.phone}</p>
        </div>

        <h3 style={styles.h3}>부칙</h3>
        <p>본 약관은 2026년 5월 14일부터 시행됩니다.</p>

        <p style={styles.footer}>
          시행일: 2026년 5월 14일<br />
          {BUSINESS_INFO.companyName}
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
    margin: '8px 0',
  },
  cpoBox: {
    background: '#FFF0EB',
    padding: 14,
    borderRadius: 10,
    fontSize: 13,
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