// PathInfo 클래스 정의
class PathInfo {
    private pathInfoMap: Map<string, string> = new Map(); // 경로와 레이블을 매핑하는 Map

    // 경로와 레이블 추가
    addPath(path: string, label: string): void {
        this.pathInfoMap.set(path, label);
    }

    // 특정 경로에 해당하는 레이블 반환
    getLabelByPath(path: string): string | undefined {
        return this.pathInfoMap.get(path);
    }

    // 전체 경로 목록 출력 (디버깅용)
    printAllPaths(): void {
        this.pathInfoMap.forEach((label, path) => {
            console.log(`${path}: ${label}`);
        });
    }
}

const pathInfo = new PathInfo();

// 경로와 레이블 추가
const paths = [
    { path: '/deud', label: '대응답' },
    { path: '/bxm5', label: 'BXM5' },
    { path: '/bxm5/trx-param', label: 'BXM5 거래파라미터 등록' },
    { path: '/bxm5/svc-inf', label: 'BXM5 SERVICE_INF 예시' },
    { path: '/bxm5/src-frame', label: 'BXM5 소스 프레임 생성' },
    { path: '/bxm4', label: 'BXM4' },
    { path: '/bxm4/trx-param', label: 'BXM4 거래파라미터 등록' },
    { path: '/bxm4/src-frame', label: 'BXM4 소스 프레임 생성' },
    { path: '/bxm4/target-omm', label: 'BXM4 iEims 타겟 <-> omm 변환기' },
    { path: '/bxm4/innorules', label: 'BXM4 이노룰스 Req, Res 생성' },
    { path: '/diff', label: '소스 Diff Check' },
    { path: '/utils', label: '유틸리티' },
    { path: '/utils/query', label: 'Query 생성기' },
    { path: '/utils/program-menu', label: '통합단말 프로그램/메뉴 등록 예시' },
];

// 경로와 레이블을 일괄 추가
paths.forEach(({ path, label }) => pathInfo.addPath(path, label));

export default pathInfo;