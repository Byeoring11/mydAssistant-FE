/**
 * Customer Number Validator for Stub Route
 * - 9자리 또는 10자리 고객번호 검증
 * - 다중 고객번호 입력 지원 (복사/붙여넣기 포함)
 */

export class CusnoValidator {
	// 9자리: 숫자 9자리
	private static readonly CUSNO_9_REGEX: RegExp = /^\d{9}$/;
	// 10자리: 숫자 10자리
	private static readonly CUSNO_10_REGEX: RegExp = /^\d{10}$/;

	// 숫자가 아닌 문자들로 분리 (공백, 쉼표, 개행 등)
	private static readonly SEPARATOR_REGEX: RegExp = /[\s,\n\r]+/;

	/**
	 * 고객번호 유효성 검사 (9자리 또는 10자리)
	 */
	public static isValid(cusno: string): boolean {
		return this.CUSNO_9_REGEX.test(cusno) || this.CUSNO_10_REGEX.test(cusno);
	}

	/**
	 * 9자리 고객번호인지 확인
	 */
	public static is9Digit(cusno: string): boolean {
		return this.CUSNO_9_REGEX.test(cusno);
	}

	/**
	 * 10자리 고객번호인지 확인
	 */
	public static is10Digit(cusno: string): boolean {
		return this.CUSNO_10_REGEX.test(cusno);
	}

	/**
	 * 고객번호 정규화
	 * - 9자리, 10자리 모두 그대로 반환 (정규화 없음)
	 */
	public static normalize(cusno: string): string {
		return cusno.trim();
	}

	/**
	 * 입력 문자열을 고객번호 배열로 분리
	 */
	private static splitCusno(input: string): string[] {
		return input
			.split(this.SEPARATOR_REGEX)
			.map(cusno => cusno.trim())
			.filter(cusno => cusno.length > 0);
	}

	/**
	 * 유효한 고객번호만 추출 (정규화된 9자리)
	 */
	public static extractValidCusno(input: string): string[] {
		const separatedCusno = this.splitCusno(input);
		return separatedCusno
			.filter(cusno => this.isValid(cusno))
			.map(cusno => this.normalize(cusno));
	}

	/**
	 * 유효하지 않은 고객번호 추출
	 */
	public static extractInvalidCusno(input: string): string[] {
		const separatedCusno = this.splitCusno(input);
		return separatedCusno.filter(cusno => !this.isValid(cusno));
	}

	/**
	 * 완료된 고객번호를 입력 문자열에서 제거
	 */
	public static removeCompletedCusno(input: string, validCusnoList: string[]): string {
		if (validCusnoList.length === 0) return input;

		let result = input;
		validCusnoList.forEach(cusno => {
			result = result.replace(cusno, '');
		});

		return result.trim();
	}

	/**
	 * 고객번호 배열을 쉼표로 연결
	 */
	public static joinCusnoList(cusnoList: string[]): string {
		return cusnoList.join(',');
	}
}
