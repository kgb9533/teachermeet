// src/Terms.js
import React from 'react';
import { BUSINESS_INFO } from './Footer';

export default function Terms({ onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>이용약관</h2>
      </div>

      <div style={styles.content}>
        <p style={styles.intro}>
          본 약관은 <strong>{BUSINESS_INFO.companyName}</strong>(이하 "회사")가 운영하는 교원 전용 매칭 서비스
          '티처밋'(이하 "서비스")의 이용과 관련하여, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
        <p style={styles.meta}>시행일: 2026년 5월 14일</p>

        <h3 style={styles.h3}>제1조 (목적)</h3>
        <p>본 약관은 회사가 제공하는 티처밋 서비스의 이용조건 및 절차, 회원과 회사의 권리·의무·책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

        <h3 style={styles.h3}>제2조 (용어의 정의)</h3>
        <ol style={styles.ol}>
          <li>"서비스"란 회사가 제공하는 교원 전용 매칭 플랫폼 '티처밋' 및 관련 부가서비스를 의미합니다.</li>
          <li>"회원"이란 본 약관에 동의하고 회사가 정한 절차에 따라 가입한 자를 말합니다.</li>
          <li>"EDU"란 회원이 서비스 내에서 유료 기능을 이용하기 위해 충전·사용하는 가상의 결제수단을 의미합니다.</li>
          <li>"교원 인증"이란 회원이 현직 또는 예비 교원임을 증빙하기 위해 회사에 자료를 제출하고 회사가 이를 확인하는 절차를 말합니다.</li>
          <li>"매칭"이란 회원 상호 간 호감 표현이 일치하여 대화 기능이 활성화되는 상태를 말합니다.</li>
        </ol>

        <h3 style={styles.h3}>제3조 (약관의 게시 및 변경)</h3>
        <ol style={styles.ol}>
          <li>회사는 본 약관을 회원이 쉽게 확인할 수 있도록 서비스 초기 화면 또는 연결 화면에 게시합니다.</li>
          <li>회사는 「약관의 규제에 관한 법률」, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
          <li>회사는 약관을 개정할 경우 적용일자 및 개정사유를 명시하여 최소 7일 전(회원에게 불리한 경우 30일 전)부터 서비스 내에 공지합니다.</li>
          <li>회원이 개정약관에 동의하지 않을 경우 이용계약을 해지할 수 있으며, 공지된 적용일 이후에도 서비스를 계속 이용하는 경우 동의한 것으로 봅니다.</li>
        </ol>

        <h3 style={styles.h3}>제4조 (이용계약의 성립 및 가입 자격)</h3>
        <ol style={styles.ol}>
          <li>이용계약은 회원이 약관에 동의하고 가입 신청을 한 후, 회사가 이를 승낙함으로써 성립됩니다.</li>
          <li>본 서비스는 만 19세 이상의 대한민국 현직·예비 교원(유·초·중·고·특수·대학 교원, 강사, 교직 이수자 등)에 한하여 가입할 수 있습니다.</li>
          <li>회사는 다음 각 호에 해당하는 신청에 대해 승낙하지 않거나 사후 이용계약을 해지할 수 있습니다.
            <ul style={styles.ul}>
              <li>타인 명의 또는 허위 정보로 가입한 경우</li>
              <li>교원 인증 자료가 위조·변조된 것으로 확인된 경우</li>
              <li>과거 본 서비스 또는 타 서비스에서 이용제한 이력이 있는 경우</li>
              <li>기타 회사가 정한 가입 자격에 부합하지 않는 경우</li>
            </ul>
          </li>
        </ol>

        <h3 style={styles.h3}>제5조 (개인정보의 보호)</h3>
        <p>회사는 「개인정보 보호법」 등 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력하며, 개인정보의 보호 및 사용에 관한 자세한 사항은 별도의 「개인정보처리방침」에서 정합니다.</p>

        <h3 style={styles.h3}>제6조 (회원의 의무)</h3>
        <ol style={styles.ol}>
          <li>회원은 다음 행위를 하여서는 안 됩니다.
            <ul style={styles.ul}>
              <li>허위 정보 등록 또는 타인의 정보 도용</li>
              <li>회사 또는 타인의 권리를 침해하거나 명예를 훼손하는 행위</li>
              <li>음란·폭력적 메시지·이미지를 전송하거나 게시하는 행위</li>
              <li>본 서비스를 영리 목적, 광고, 알선, 종교·정치적 권유 등으로 이용하는 행위</li>
              <li>매칭 상대를 협박·스토킹·괴롭히는 행위</li>
              <li>EDU 또는 계정을 타인에게 양도·매매·대여하는 행위</li>
              <li>비정상적인 방법으로 EDU를 취득하거나 서비스를 이용하는 행위</li>
              <li>기타 관계 법령에 위반되는 행위</li>
            </ul>
          </li>
          <li>회원의 의무 위반으로 발생한 결과에 대해 회원은 민·형사상 책임을 지며, 회사는 즉시 이용을 제한할 수 있습니다.</li>
        </ol>

        <h3 style={styles.h3}>제7조 (EDU의 충전 및 사용)</h3>
        <ol style={styles.ol}>
          <li>회원은 회사가 정한 결제수단(신용카드, 간편결제 등)을 통해 EDU를 유료로 충전할 수 있습니다.</li>
          <li>충전 비율은 <strong>1,000원 = 100 EDU</strong>를 기본으로 하며, 회사는 패키지·이벤트에 따라 별도 비율을 적용할 수 있습니다.</li>
          <li>EDU는 슈퍼좋아요, 프로필 부스트, 프로필 열람권, 메시지 우선 발송, 추천 강조 노출 등 회사가 지정한 서비스 내 기능 이용에만 사용할 수 있습니다.</li>
          <li>EDU는 현금으로 환급되지 않으며, 회원 간 양도·매매할 수 없습니다.</li>
          <li>충전된 EDU의 유효기간은 마지막 충전일로부터 <strong>5년</strong>이며, 유효기간이 경과한 EDU는 소멸됩니다.</li>
          <li>회사는 EDU 사용처별 가격(소모량)을 사전 고지 후 변경할 수 있으며, 이미 충전된 EDU의 가치는 변경되지 않습니다.</li>
        </ol>

        <h3 style={styles.h3}>제8조 (청약철회 및 환불)</h3>
        <ol style={styles.ol}>
          <li>회원은 EDU 결제일로부터 7일 이내, 충전한 EDU를 한 번도 사용하지 않은 경우 청약철회(전액 환불)를 요청할 수 있습니다.</li>
          <li>일부라도 EDU를 사용한 경우, 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「소비자분쟁해결기준」에 따라 잔여 EDU에 한하여 환불이 가능합니다.</li>
          <li>환불 신청은 {BUSINESS_INFO.email}(또는 서비스 내 1:1 문의)로 접수하며, 회사는 영업일 기준 3~5일 이내 처리합니다.</li>
          <li>본 조항에 관한 상세 내용은 별도의 「환불정책」에서 정합니다.</li>
        </ol>

        <h3 style={styles.h3}>제9조 (서비스의 제공 및 변경)</h3>
        <ol style={styles.ol}>
          <li>회사는 연중무휴 1일 24시간 서비스를 제공함을 원칙으로 합니다. 다만, 시스템 점검·교체, 통신장애, 천재지변 등 불가항력적 사유가 있는 경우 일시 중단될 수 있습니다.</li>
          <li>회사는 영업상·기술상 필요에 따라 제공 중인 서비스 전부 또는 일부를 변경할 수 있으며, 변경 시 사전 공지합니다.</li>
        </ol>

        <h3 style={styles.h3}>제10조 (이용제한 및 계정정지)</h3>
        <ol style={styles.ol}>
          <li>회사는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 사전 통보 없이 경고·일시정지·영구이용정지 등의 조치를 할 수 있습니다.</li>
          <li>영구이용정지 시 회사는 잔여 EDU를 환급하지 않을 수 있으며, 이는 회원의 약관 위반 책임에 기인한 손해배상의 일환으로 봅니다.</li>
        </ol>

        <h3 style={styles.h3}>제11조 (회원 탈퇴)</h3>
        <ol style={styles.ol}>
          <li>회원은 언제든지 서비스 내 설정 메뉴 또는 고객센터를 통해 탈퇴를 요청할 수 있습니다.</li>
          <li>탈퇴 즉시 회원 정보 및 매칭·대화 내역은 관련 법령에서 정한 보관기간을 제외하고 파기됩니다.</li>
          <li>탈퇴 시점에 잔여 EDU는 본 약관 제8조에 따른 환불 사유에 해당하지 않는 한 소멸합니다.</li>
        </ol>

        <h3 style={styles.h3}>제12조 (책임의 제한)</h3>
        <ol style={styles.ol}>
          <li>회사는 회원 간의 매칭·만남·교제 등 오프라인 활동에서 발생한 분쟁·피해에 대해 직접적인 책임을 지지 않습니다.</li>
          <li>회사는 회원이 게재한 정보·자료의 신뢰도, 정확성에 대해 보증하지 않으며, 회원의 허위 정보로 인한 피해에 대한 책임은 해당 회원에게 있습니다.</li>
          <li>회사는 천재지변, 정전, 통신사·결제대행사 장애 등 회사의 귀책사유가 없는 사유로 인한 손해에 대해 책임지지 않습니다.</li>
        </ol>

        <h3 style={styles.h3}>제13조 (분쟁 해결 및 관할 법원)</h3>
        <ol style={styles.ol}>
          <li>본 약관에 관하여 다툼이 있는 경우, 회사와 회원은 신의성실의 원칙에 따라 협의로 해결함을 원칙으로 합니다.</li>
          <li>협의가 이루어지지 않을 경우 「민사소송법」상 관할 법원에 소를 제기할 수 있습니다.</li>
        </ol>

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
  ol: {
    paddingLeft: 20,
    margin: '8px 0',
  },
  ul: {
    paddingLeft: 18,
    margin: '6px 0',
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