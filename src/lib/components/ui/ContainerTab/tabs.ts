class Tab {
    private labels: string[];

    constructor(labels: string[]) {
        this.labels = labels;
    }

    public getLabels(): string[] {
        return this.labels;
    }

    public getLabelsCount(): number {
        return this.labels.length;
    }
}

const tabs: Map<string, Tab> = new Map<string, Tab>();
tabs.set('deud', new Tab(['대응답 적재', '대응답 이력 보기']));
tabs.set('bxm5', new Tab(['거래파라미터 등록', '소스 프레임 생성', 'SERVICE_INF 예시']));
tabs.set('bxm4', new Tab(['거래파라미터 등록', '타겟↔️omm 변환', '소스 프레임 생성']));
tabs.set('diff', new Tab(['SOL WEB', 'BXM5', 'BXM4', 'Diff 체크 이력 보기']));

export default tabs;