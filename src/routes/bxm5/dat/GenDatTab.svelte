<script lang="ts">
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';
	import { Timer, type TimerState } from '$lib/utils/timer/Timer';

	// 테스트 모드 설정 (백엔드 준비되면 false로 변경)
	const TEST_MODE = true;

	// Mock 단계 데이터
	const MOCK_STEPS: StepResult[] = [
		{
			step: 'INIT_DRIVER',
			description: '드라이버 초기화',
			progress: 10,
			success: true,
			message: '드라이버 초기화 완료'
		},
		{
			step: 'OPEN_PAGE',
			description: 'BXM5 Admin 페이지 접속',
			progress: 20,
			success: true,
			message: '페이지 접속 완료'
		},
		{
			step: 'LOGIN',
			description: '로그인 처리',
			progress: 35,
			success: true,
			message: '로그인 완료'
		},
		{
			step: 'NAVIGATE',
			description: '등록 페이지 이동',
			progress: 50,
			success: true,
			message: '등록 페이지 이동 완료'
		},
		{
			step: 'INPUT_BASIC',
			description: '기본 정보 입력',
			progress: 70,
			success: true,
			message: '기본 정보 입력 완료'
		},
		{
			step: 'INPUT_ATTR',
			description: '속성 정보 입력',
			progress: 85,
			success: true,
			message: '속성 정보 입력 완료'
		},
		{
			step: 'SAVE',
			description: '저장 및 확인',
			progress: 100,
			success: true,
			message: '거래파라미터 등록 완료'
		}
	];

	/**
	 * 지연 함수
	 */
	const delay = (ms: number): Promise<void> => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	/**
	 * [테스트용] Mock SSE 스트리밍 시뮬레이션
	 * 각 단계를 순차적으로 실행하며 진행상황 업데이트
	 */
	const mockRegister = async (): Promise<void> => {
		for (const step of MOCK_STEPS) {
			// 랜덤 딜레이 (0.5초 ~ 1.5초) - 실제 처리 시간 시뮬레이션
			await delay(500 + Math.random() * 1000);

			// 상태 업데이트
			progress = step.progress;
			currentStep = step.description;

			// 실패 시뮬레이션 (필요시 주석 해제)
			// if (step.step === "INPUT_BASIC") {
			//   status = "error";
			//   outputMessage = "기본 정보 입력 중 오류가 발생했습니다.";
			//   return;
			// }

			// 마지막 단계 완료
			if (step.progress === 100) {
				status = 'success';
				outputMessage = step.message;
			}
		}
	};

	// 거래파라미터 등록 단계 결과 타입 인터페이스 정의
	interface StepResult {
		step: string;
		description: string;
		progress: number;
		success: boolean;
		message: string;
	}

	// 상태 관리
	let trxCd = $state('RSMPM');
	let trxNm = $state('');

	let isLoading = $state(false);
	let timerState = $state<TimerState>({ min: '00', sec: '00', msec: '00' });

	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let progress = $state(0);
	let currentStep = $state('');
	let outputMessage = $state('');

	// 입력 필드 참조
	let trxCdInput: HTMLInputElement;
	let trxNmInput: HTMLInputElement;

	// 타이머 인스턴스
	let timer: Timer | null = null;

	// 거래코드 정규식 패턴
	const TRX_CD_REGEX = /^RSMPM\d{4}[A-Z]\d{2}$/;

	/**
	 * 시간 포맷팅 (mm:ss:ms)
	 */
	const formatTime = (state: TimerState): string => {
		return `${state.min}:${state.sec}:${state.msec}`;
	};

	/**
	 * 입력값 유효성 검증
	 */
	const validateInput = (): boolean => {
		if (!TRX_CD_REGEX.test(trxCd)) {
			showNotification('error', '유효하지 않은 거래코드입니다.\n형식: RSMPM0000A00');
			trxCd = 'RSMPM';
			trxCdInput?.focus();
			return false;
		}

		return true;
	};

	/**
	 * 타이머 시작
	 */
	const startTimer = (): void => {
		timer = new Timer({
			onTick: (state) => {
				timerState = state;
			},
			onReset: (state) => {
				timerState = state;
			}
		});
		timer.start();
	};

	/**
	 * 타이머 정지
	 */
	const stopTimer = (): void => {
		if (timer) {
			timer.stop();
			timer = null;
		}
	};

	/**
	 * [실제] SSE 스트리밍 API 호출
	 */
	const realRegister = async (): Promise<void> => {
		const response = await fetch('/bxm5/dat/register/stream', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ trxCd, trxNm })
		});

		if (!response.ok) {
			throw new Error('스트림 연결 실패');
		}

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();

		if (!reader) {
			throw new Error('스트림 리더 생성 실패');
		}

		// SSE 스트림 읽기
		while (true) {
			const { done, value } = await reader.read();

			if (done) break;

			const chunk = decoder.decode(value, { stream: true });
			const lines = chunk.split('\n');

			for (const line of lines) {
				if (line.startsWith('event: done')) {
					break;
				}

				if (line.startsWith('data: ')) {
					try {
						const data: StepResult = JSON.parse(line.slice(6));

						progress = data.progress;
						currentStep = data.description;

						if (!data.success) {
							status = 'error';
							outputMessage = data.message;
							return;
						}

						if (data.progress === 100) {
							status = 'success';
							outputMessage = data.message;
						}
					} catch {
						// JSON 파싱 오류 무시
					}
				}
			}
		}
	};

	/**
	 * 거래파라미터 등록 API 호출
	 */
	const register = async (): Promise<void> => {
		if (!validateInput()) return;

		// 상태 초기화
		isLoading = true;
		status = 'loading';
		progress = 0;
		currentStep = '';
		outputMessage = '';
		timerState = { min: '00', sec: '00', msec: '00' };

		// 타이머 시작
		startTimer();

		try {
			if (TEST_MODE) {
				// 테스트 모드: Mock 데이터로 시뮬레이션
				await mockRegister();
			} else {
				// 실제 모드: SSE 스트리밍 API 호출
				await realRegister();
			}
		} catch (error) {
			console.error('Error 발생:', error);
			status = 'error';
			outputMessage = error instanceof Error ? error.message : '등록 실패';
		} finally {
			stopTimer();
			isLoading = false;
		}
	};

	/**
	 * 폼 초기화
	 */
	const handleReset = (): void => {
		trxCd = 'RSMPM';
		trxNm = '';
		timerState = { min: '00', sec: '00', msec: '00' };
		progress = 0;
		currentStep = '';
		status = 'idle';
		outputMessage = '';
		isLoading = false;
		stopTimer();
	};

	// 컴포넌트 언마운트 시 타이머 정리
	$effect(() => {
		return () => {
			if (timer) {
				timer.terminate();
			}
		};
	});
</script>

<div class="container">
	<!-- Animated background gradients -->
	<div class="bg-effects">
		<div class="bg-blob bg-blob-pink"></div>
		<div class="bg-blob bg-blob-cyan"></div>
		<div class="bg-blob bg-blob-purple"></div>
	</div>

	<!-- Main Card -->
	<div class="card-wrapper">
		<!-- Glow effect behind card -->
		<div class="card-glow"></div>

		<!-- Glass Card -->
		<div class="glass-card">
			<!-- Header -->
			<div class="header">
				<div class="header-dot"></div>
				<h2>BXM5 거래파라미터 등록</h2>
			</div>

			<!-- Form Fields -->
			<div class="form-fields">
				<!-- Transaction Code -->
				<div class="field-group">
					<label for="trxCode">거래코드</label>
					<div class="input-wrapper">
						<input
							id="trxCode"
							type="text"
							bind:value={trxCd}
							bind:this={trxCdInput}
							placeholder="RSMPM~"
							disabled={isLoading}
						/>
					</div>
				</div>

				<!-- Transaction Name -->
				<div class="field-group">
					<label for="trxName">거래명</label>
					<div class="input-wrapper">
						<input
							id="trxName"
							type="text"
							bind:value={trxNm}
							bind:this={trxNmInput}
							placeholder="[업무] 상세 서비스 설명"
							disabled={isLoading}
						/>
					</div>
				</div>

				<div class="info-box">
					<span class="info-icon">ℹ️</span>
					<p>Selenium 드라이버가 구동되어 자동 등록을 시작합니다.</p>
				</div>
			</div>

			<!-- Loading Section -->
			{#if status !== 'idle'}
				<div class="loading-section">
					<!-- Timer Display -->
					<div class="timer-container">
						<svg class="timer-svg" viewBox="0 0 128 128">
							<circle
								cx="64"
								cy="64"
								r="56"
								stroke="rgba(255,255,255,0.1)"
								stroke-width="4"
								fill="none"
							/>
							<circle
								cx="64"
								cy="64"
								r="56"
								stroke="url(#timerGradient)"
								stroke-width="4"
								fill="none"
								stroke-linecap="round"
								stroke-dasharray="{progress * 3.52} 352"
								class="progress-circle"
							/>
							<defs>
								<linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stop-color="#ec4899" />
									<stop offset="50%" stop-color="#a855f7" />
									<stop offset="100%" stop-color="#06b6d4" />
								</linearGradient>
							</defs>
						</svg>
						<div class="timer-text">
							<span class="timer-value">{timerState.sec}:{timerState.msec}</span>
							<span class="timer-label">
								{#if status === 'loading'}처리중
								{:else if status === 'success'}완료
								{:else if status === 'error'}실패
								{/if}
							</span>
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="progress-section">
						<div class="progress-header">
							<span class="progress-label">{currentStep || '준비중...'}</span>
							<span class="progress-value">{progress}%</span>
						</div>
						<div class="progress-bar-container">
							<div class="progress-bar-bg"></div>
							<div class="progress-bar-fill" style="width: {progress}%">
								<div class="progress-shimmer"></div>
							</div>
							<div class="progress-bar-glow" style="width: {progress}%"></div>
						</div>
					</div>

					<!-- Status Messages -->
					<div class="status-message">
						{#if status === 'loading'}
							<div class="loading-dots">
								<span class="dot dot-1"></span>
								<span class="dot dot-2"></span>
								<span class="dot dot-3"></span>
							</div>
							<span class="status-text">파라미터 등록 처리중...</span>
						{:else if status === 'success'}
							<svg
								class="status-icon success"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span class="status-text success">{outputMessage}</span>
						{:else if status === 'error'}
							<svg class="status-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							<span class="status-text error">{outputMessage}</span>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Buttons -->
			<div class="button-group">
				{#if status === 'idle' || status === 'loading'}
					<button class="btn btn-primary" onclick={register} disabled={isLoading}>
						<span class="btn-glow"></span>
						<span class="btn-content">{isLoading ? '처리중...' : '등록하기'}</span>
					</button>
				{:else}
					<button class="btn btn-reset" onclick={handleReset}>
						<span class="btn-glow reset"></span>
						<span class="btn-content">↺ 처음으로</span>
					</button>
				{/if}
			</div>

			<!-- Decorative elements -->
			<div class="deco-circle deco-circle-1"></div>
			<div class="deco-circle deco-circle-2"></div>
		</div>
	</div>
</div>

<style>
	.container {
		min-height: 100%;
		display: flex;
		align-items: baseline;
		justify-content: center;
		padding: 2rem;
		position: relative;
		overflow: auto;
	}

	/* Background Effects */
	.bg-effects {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.bg-blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
		animation: pulse 4s ease-in-out infinite;
	}

	.bg-blob-pink {
		top: 25%;
		left: -5rem;
		width: 24rem;
		height: 24rem;
		background: rgba(236, 72, 153, 0.2);
	}

	.bg-blob-cyan {
		bottom: 25%;
		right: -5rem;
		width: 24rem;
		height: 24rem;
		background: rgba(6, 182, 212, 0.2);
		animation-delay: 1s;
	}

	.bg-blob-purple {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 37.5rem;
		height: 37.5rem;
		background: rgba(168, 85, 247, 0.1);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.02);
		}
	}

	/* Card Wrapper */
	.card-wrapper {
		position: relative;
		width: 100%;
		max-width: 28rem;
	}

	.card-glow {
		position: absolute;
		inset: -4px;
		background: linear-gradient(135deg, #ec489a, #a955f7, #06b5d4);
		border-radius: 1.5rem;
		filter: blur(30px);
		opacity: 0.1;
		animation: pulse 4s ease-in-out infinite;
	}

	/* Glass Card */
	.glass-card {
		position: relative;
		backdrop-filter: blur(24px);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1.5rem;
		padding: 2rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	/* Header */
	.header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.header-dot {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background: #ec4899;
		box-shadow: 0 0 12px rgba(236, 72, 153, 0.5);
		animation: pulse 2s ease-in-out infinite;
	}

	.header h2 {
		font-size: 1.25rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	/* Form Fields */
	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.726);
	}

	.input-wrapper {
		position: relative;
	}

	.input-wrapper::before {
		content: '';
		position: absolute;
		inset: -2px;
		background: linear-gradient(165deg, rgba(236, 72, 153, 0.5), rgba(168, 85, 247, 0.5));
		border-radius: 0.75rem;
		filter: blur(4px);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.input-wrapper:focus-within::before {
		opacity: 1;
	}

	.input-wrapper input {
		position: relative;
		width: 100%;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		color: white;
		font-size: 1rem;
		outline: none;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}

	.input-wrapper input::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	.input-wrapper input:focus {
		border-color: rgba(236, 72, 153, 0.5);
	}

	.input-wrapper input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.info-box {
        margin-top: 0.5rem;
		padding: 0.75rem;
        background: rgba(6, 182, 212, 0.1);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 0.75rem;
        display: flex; gap: 0.5rem;
		align-items: center;
    }

    .info-box p {
		margin: 0;
		font-size: 0.8rem;
		color: #a5f3fc;
	}

	/* Loading Section */
	.loading-section {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Timer */
	.timer-container {
		display: flex;
		justify-content: center;
		position: relative;
	}

	.timer-svg {
		width: 8rem;
		height: 8rem;
	}

	.progress-circle {
		transform-origin: center;
		transform: rotate(-90deg);
		filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.5));
		transition: stroke-dasharray 0.3s ease-out;
	}

	.timer-text {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.timer-value {
		font-size: 1.5rem;
		font-family: monospace;
		font-weight: bold;
		color: white;
		font-variant-numeric: tabular-nums;
	}

	.timer-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 0.25rem;
	}

	/* Progress Bar */
	.progress-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
	}

	.progress-label {
		color: rgba(255, 255, 255, 0.6);
	}

	.progress-value {
		color: white;
		font-family: monospace;
	}

	.progress-bar-container {
		position: relative;
		height: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 9999px;
		overflow: hidden;
	}

	.progress-bar-bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			rgba(236, 72, 153, 0.2),
			rgba(168, 85, 247, 0.2),
			rgba(6, 182, 212, 0.2)
		);
	}

	.progress-bar-fill {
		position: absolute;
		inset: 0;
		right: auto;
		background: linear-gradient(90deg, #ec4899, #a855f7, #06b6d4);
		border-radius: 9999px;
		transition: width 0.3s ease-out;
		overflow: hidden;
	}

	.progress-shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.progress-bar-glow {
		position: absolute;
		inset: 0;
		right: auto;
		background: linear-gradient(90deg, #ec4899, #a855f7, #06b6d4);
		border-radius: 9999px;
		filter: blur(4px);
		opacity: 0.5;
		transition: width 0.3s ease-out;
	}

	/* Status Message */
	.status-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.loading-dots {
		display: flex;
		gap: 0.25rem;
	}

	.dot {
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		animation: bounce 1s infinite;
	}

	.dot-1 {
		background: #ec4899;
		animation-delay: 0ms;
	}

	.dot-2 {
		background: #a855f7;
		animation-delay: 150ms;
	}

	.dot-3 {
		background: #06b6d4;
		animation-delay: 300ms;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	.status-text {
		color: rgba(255, 255, 255, 0.6);
	}

	.status-text.success {
		color: #4ade80;
	}

	.status-text.error {
		color: #f87171;
	}

	.status-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.status-icon.success {
		color: #4ade80;
	}

	.status-icon.error {
		color: #f87171;
	}

	/* Buttons */
	.button-group {
		margin-top: 2rem;
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-glow {
		position: absolute;
		inset: -2px;
		background: linear-gradient(90deg, #ec4899, #a855f7, #06b6d4);
		border-radius: 0.75rem;
		filter: blur(8px);
		opacity: 0.6;
		transition: opacity 0.3s ease;
	}

	.btn-glow.reset {
		background: linear-gradient(90deg, #06b6d4, #3b82f6);
	}

	.btn:hover:not(:disabled) .btn-glow {
		opacity: 1;
	}

	.btn-content {
		position: relative;
		display: block;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		color: white;
		font-weight: 500;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.btn-primary .btn-content {
		background: linear-gradient(
			90deg,
			rgba(236, 72, 153, 0.8),
			rgba(168, 85, 247, 0.8),
			rgba(6, 182, 212, 0.8)
		);
	}

	.btn-reset .btn-content {
		background: linear-gradient(90deg, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.8));
	}

	/* Decorative Circles */
	.deco-circle {
		position: absolute;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 50%;
		pointer-events: none;
	}

	.deco-circle-1 {
		top: 1rem;
		right: 1rem;
		width: 5rem;
		height: 5rem;
	}

	.deco-circle-2 {
		bottom: 1rem;
		left: 1rem;
		width: 3rem;
		height: 3rem;
	}
</style>
