export class CusnoValidator {
    private static readonly CUSNO_REGEX: RegExp = /^0\d{9}$|^[1-9]\d{8}$/;
    private static readonly SEPARATOR_REGEX: RegExp = /\D+/;
    
    // 고객번호 유효성 검사
    public static isValid(cusno: string): boolean {
        return this.CUSNO_REGEX.test(cusno);
    }
    
    // 고객번호 정규화 (앞의 '0' 제거)
    public static normalize(cusno: string): string {
        return cusno.startsWith("0") ? cusno.slice(1) : cusno;
    }

    // Input으로 받은 고객번호 문자열 Trim & Split
    public static splitCusno(input: string): string[] {
        return input.trim().split(this.SEPARATOR_REGEX);
    }
    
    // 입력 문자열에서 유효한 고객번호 추출
    public static extractValidCusno(input: string): string[] {
        const separatedCusno = this.splitCusno(input);
        return separatedCusno
            .filter((cusno) => this.isValid(cusno))
            .map((cusno) => this.normalize(cusno));
    }

    // 입력 문자열에서 유효하지 않은 고객번호 추출
    public static extractInvalidCusno(input: string): string[] {
        const separatedCusno = this.splitCusno(input);
        return separatedCusno.filter((cusno) => !this.isValid(cusno));
    }

    public static removeCompletedCusno(input: string, validCusnoList: string[]): string {
        return validCusnoList.reduce((acc, cusno) => acc.replace(cusno, ""), input);
    }
}