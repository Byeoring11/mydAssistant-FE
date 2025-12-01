<script lang="ts">
	import { showNotification } from "$lib/components/ui/FloatingUI/notificationStore";

	// ============================================================================
	// Types & Interfaces
	// ============================================================================

	interface ParsedColumn {
		name: string;
		type: string;
		length: string | null;
		comment: string;
	}

	interface JavaField {
		type: string;
		name: string;
		comment: string;
		length: string;
		scale: string;
	}

	type SqlTypeMapper = Record<string, (length: string | null) => string>;

	// ============================================================================
	// State Management (Svelte 5 Runes)
	// ============================================================================

	let pasteArea = $state('');
	let result = $state('');
	let showTooltip = $state(false);
	let copyButtonText = $state('📋 복사하기');
	let resultTextarea = $state<HTMLTextAreaElement>();

	const isCopyDisabled = $derived(!result.trim());

	// ============================================================================
	// Constants & Configuration
	// ============================================================================

	const SQL_TYPE_PATTERNS = {
		STRING: /CHAR|VARCHAR|TEXT/i,
		NUMBER: /NUMBER|DECIMAL|NUMERIC/i,
		DATE: /DATE|TIMESTAMP/i
	} as const;

	const INTEGER_MAX_LENGTH = 9;
	const COPY_FEEDBACK_DURATION = 1500;

	// ============================================================================
	// Utility Functions
	// ============================================================================

	/**
	 * snake_case를 camelCase로 변환
	 * @example toCamelCase('USER_NAME') → 'userName'
	 */
	const toCamelCase = (str: string): string =>
		str
			.toLowerCase()
			.split('_')
			.map((word, idx) => (idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
			.join('');

	/**
	 * 타입과 길이 파싱 (괄호 분리)
	 * @example parseTypeWithLength('VARCHAR(50)') → { type: 'VARCHAR', length: '50' }
	 */
	const parseTypeWithLength = (token: string): { type: string; length: string | null } => {
		const match = token.trim().match(/^([^()]+)(?:\(([^)]+)\))?$/);
		return {
			type: match?.[1] ?? token,
			length: match?.[2] ?? null
		};
	};

	/**
	 * 길이 문자열 파싱 (정수 부분과 소수점 부분 분리)
	 * @example parseLengthString('18,3') → { length: '18', scale: '3' }
	 */
	const parseLengthString = (
		lengthStr: string | null
	): { length: string; scale: string } => {
		if (!lengthStr) return { length: '0', scale: '0' };

		const [length = '0', scale = '0'] = lengthStr.split(',');
		return { length, scale };
	};

	// ============================================================================
	// Type Mapping Logic
	// ============================================================================

	/**
	 * SQL 타입을 Java 타입으로 매핑하는 전략 패턴
	 */
	const sqlTypeMappers: SqlTypeMapper = {
		String: () => 'String',
		Number: (length: string | null) => {
			if (!length) return 'BigDecimal';
			const { length: len } = parseLengthString(length);
			return Number(len) <= INTEGER_MAX_LENGTH ? 'Integer' : 'BigDecimal';
		},
		DateTime: () => 'LocalDateTime',
		Default: () => 'Object'
	};

	/**
	 * SQL 타입을 Java 타입으로 변환
	 */
	const mapSqlToJava = (sqlType: string, length: string | null): string => {
		const upperType = sqlType.toUpperCase();

		if (SQL_TYPE_PATTERNS.STRING.test(upperType)) {
			return sqlTypeMappers.String(length);
		}

		if (SQL_TYPE_PATTERNS.NUMBER.test(upperType)) {
			return sqlTypeMappers.Number(length);
		}

		if (SQL_TYPE_PATTERNS.DATE.test(upperType)) {
			return sqlTypeMappers.DateTime(length);
		}

		return sqlTypeMappers.Default(length);
	};

	// ============================================================================
	// Parsing Logic
	// ============================================================================

	/**
	 * 원본 텍스트를 행렬로 파싱
	 */
	const parseToMatrix = (raw: string): string[][] =>
		raw
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => line.split(/\s+/));

	/**
	 * 행 데이터 정규화 (컬럼 개수에 따라 필요한 데이터만 추출)
	 */
	const normalizeRow = (row: string[]): [string, string, string] | null => {
		const columnMap: Record<number, [number, number, number]> = {
			4: [0, 1, 3],
			5: [0, 1, 4],
			6: [0, 1, 5]
		};

		const indices = columnMap[row.length];
		if (!indices) return null;

		const [nameIdx, typeIdx, commentIdx] = indices;
		return [row[nameIdx], row[typeIdx], row[commentIdx]];
	};

	/**
	 * 정규화된 행을 ParsedColumn 객체로 변환
	 */
	const rowToParsedColumn = ([name, typeStr, comment]: [
		string,
		string,
		string
	]): ParsedColumn => {
		const { type, length } = parseTypeWithLength(typeStr);
		return { name, type, length, comment };
	};

	/**
	 * ParsedColumn을 JavaField로 변환
	 */
	const toJavaField = (column: ParsedColumn): JavaField => {
		const javaType = mapSqlToJava(column.type, column.length);
		const javaName = toCamelCase(column.name);
		const { length, scale } = parseLengthString(column.length);

		return {
			type: javaType,
			name: javaName,
			comment: column.comment,
			length,
			scale
		};
	};

	/**
	 * JavaField를 포맷된 문자열로 변환
	 */
	const formatJavaField = ({ type, name, comment, length, scale }: JavaField): string =>
		`${type}   ${name} ${comment}  ${length}    ${scale}`;

	// ============================================================================
	// Main Conversion Pipeline
	// ============================================================================

	/**
	 * 변환 파이프라인: 원본 텍스트 → Java 필드 문자열
	 */
	const convertToJavaFields = (raw: string): string => {
		const matrix = parseToMatrix(raw);

		const javaFields = matrix
			.map(normalizeRow)
			.filter((row): row is [string, string, string] => row !== null)
			.map(rowToParsedColumn)
			.map(toJavaField)
			.map(formatJavaField);

		return javaFields.join('\n');
	};

	// ============================================================================
	// Event Handlers
	// ============================================================================

	/**
	 * 변환 버튼 클릭 핸들러
	 */
	const handleConvert = (): void => {
		const input = pasteArea.trim();

		if (!input) {
			showNotification('error', '내용을 입력해주세요.');
			return;
		}

		try {
			result = convertToJavaFields(input);
		} catch (error) {
			console.error('변환 중 오류 발생:', error);
			showNotification('error', '변환 중 오류가 발생했습니다. 입력 형식을 확인해주세요.');
		}
	};

	/**
	 * 복사하기 버튼 클릭 핸들러
	 */
	const handleCopy = async (): Promise<void> => {
		if (!result || !resultTextarea) return;

		try {
			// 결과 textarea 선택 및 복사
			resultTextarea.select();
			document.execCommand('copy');

			// 성공 피드백
			copyButtonText = '✅ 복사됨!';
			setTimeout(() => {
				copyButtonText = '📋 복사하기';
			}, COPY_FEEDBACK_DURATION);
		} catch (error) {
			console.error('복사 실패:', error);
			showNotification('error', '복사에 실패했습니다. 결과를 직접 선택하여 복사해주세요.');
		}
	};
</script>

<div class="page-wrapper">
	<!-- Header -->
	<header class="service-header">
		<div
			class="tooltip-wrapper"
			role="tooltip"
			onmouseenter={() => (showTooltip = true)}
			onmouseleave={() => (showTooltip = false)}
		>
			<span class="tooltip-icon">ℹ️사용법</span>
			{#if showTooltip}
				<div class="tooltip-content">
					<img src="/images/bxm4_dbio_omm.png" alt="사용법 이미지" />
				</div>
			{/if}
		</div>
	</header>

	<!-- Main Content -->
	<div class="content-container">
		<!-- Input Panel -->
		<div class="panel input-panel">
			<div class="panel-header">
				<h3 class="panel-title">📝 입력</h3>
				<span class="panel-subtitle">테이블 정보를 붙여넣으세요</span>
			</div>
			<textarea
				bind:value={pasteArea}
				placeholder=""
				class="glass-textarea"
			></textarea>
		</div>

		<!-- Convert Button -->
		<button onclick={handleConvert} class="convert-btn-vertical">
			<span class="convert-icon">🔄</span>
			<span class="convert-text">변환</span>
		</button>

		<!-- Result Panel -->
		<div class="panel result-panel">
			<div class="panel-header">
				<h3 class="panel-title">🖨️ 결과</h3>
				<button onclick={handleCopy} class="copy-btn-header" disabled={isCopyDisabled}>
					{copyButtonText}
				</button>
			</div>
			<textarea
				bind:this={resultTextarea}
				bind:value={result}
				placeholder="변환된 결과를 그대로 복사해서 omm에 붙여넣기 해보세요"
				class="glass-textarea result-area"
				readonly
			></textarea>
		</div>
	</div>
</div>

<style>
	.page-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		width: 100%;
		max-width: 1600px;
		margin: 0 auto;
		min-height: 100vh;
	}

	/* Header Styles */
	.service-header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
		justify-content: center;
		flex-wrap: wrap;
	}

	.tooltip-wrapper {
		position: relative;
		cursor: help;
	}

	.tooltip-icon {
		padding: 0.5rem 0.8rem;
        background: rgba(6, 182, 212, 0.3);
        border: 1px solid rgba(6, 182, 212, 0.2);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
		transition: all 0.3s ease;
		display: inline-flex;
	}

	.tooltip-icon:hover {
        background: rgba(6, 182, 212, 0.5);
		transform: translateY(-2px);
	}

	.tooltip-content {
		position: absolute;
		top: calc(100% + 0.75rem);
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		animation: fadeIn 0.2s ease;
	}

	.tooltip-content img {
		max-width: 600px;
		width: 100%;
		height: auto;
		border-radius: 0.5rem;
		display: block;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	/* Content Container - 가로 레이아웃 */
	.content-container {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1.5rem;
		align-items: stretch;
	}

	/* Panel Styles */
	.panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 1.25rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		height: 600px;
		transition: all 0.3s ease;
	}

	.panel:hover {
		border-color: rgba(255, 255, 255, 0.12);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.panel-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
		margin: 0;
	}

	.panel-subtitle {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		font-weight: 400;
		margin-left: auto;
	}

	/* Textarea Styles */
	.glass-textarea {
		flex: 1;
		width: 100%;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.75rem;
		color: rgba(255, 255, 255, 0.9);
		font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		resize: none;
		transition: all 0.3s ease;
		box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.glass-textarea:focus {
		outline: none;
		border-color: rgba(236, 72, 153, 0.4);
		background: rgba(0, 0, 0, 0.2);
		box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1), inset 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.glass-textarea::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	.result-area {
		background: rgba(0, 0, 0, 0.25);
	}

	/* Vertical Convert Button */
	.convert-btn-vertical {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 2rem 1.25rem;
		background: linear-gradient(180deg, rgba(236, 72, 153, 0.25), rgba(239, 68, 68, 0.25));
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(236, 72, 153, 0.4);
		border-radius: 1rem;
		color: #ffffff;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 16px rgba(236, 72, 153, 0.2);
		min-width: 100px;
		align-self: center;
	}

	.convert-btn-vertical:hover {
		background: linear-gradient(180deg, rgba(236, 72, 153, 0.35), rgba(239, 68, 68, 0.35));
		transform: scale(1.05);
		box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
	}

	.convert-btn-vertical:active {
		transform: scale(0.98);
	}

	.convert-icon {
		font-size: 2rem;
		animation: rotate 2s linear infinite;
	}

	.convert-btn-vertical:hover .convert-icon {
		animation: rotate 0.6s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.convert-text {
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	/* Copy Button in Header */
	.copy-btn-header {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		white-space: nowrap;
	}

	.copy-btn-header:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.copy-btn-header:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.content-container {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
		}

		.convert-btn-vertical {
			flex-direction: row;
			padding: 1rem 2rem;
			width: 100%;
		}

		.convert-icon {
			font-size: 1.5rem;
		}

		.panel {
			height: 400px;
		}
	}

	@media (max-width: 768px) {
		.page-wrapper {
			padding: 1rem;
		}

		.title {
			font-size: 1.5rem;
		}

		.tooltip-content img {
			max-width: 90vw;
		}

		.panel {
			padding: 1rem;
			height: 350px;
		}

		.panel-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.panel-subtitle {
			margin-left: 0;
		}
	}
</style>