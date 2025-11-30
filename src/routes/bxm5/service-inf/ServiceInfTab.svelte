<script lang="ts">
	import serviceInfEaiYes from '$lib/images/service_inf_eai.png';
	import serviceInfEaiNo from '$lib/images/service_inf_no_eai.png';
	import serviceInfCore from '$lib/images/service_inf_core.png';

	// Svelte 5 runes 사용
	let activeType = $state<'y' | 'n' | 'core' | null>(null);

	// 이미지 데이터 타입 정의
	interface ImageData {
		url: string;
		alt: string;
		info: string;
	}

	type ImageMapType = {
		y: ImageData;
		n: ImageData;
		core: ImageData;
	};

	// 이미지 경로 및 정보 정의
	const imageMap: ImageMapType = {
		y: {
			url: serviceInfEaiYes,
			alt: 'EAI 호출이 있는 경우 등록 예시',
			info: "<span class='color-text'>과거서비스CODE</span>와 <span class='color-text'>관련팀명</span>은 없는 경우 입력안해도 된다 (EAI 호출 포함 예시)"
		},
		n: {
			url: serviceInfEaiNo,
			alt: 'EAI 호출이 없는 경우 등록 예시',
			info: "<span class='color-text'>과거서비스CODE</span>와 <span class='color-text'>관련팀명</span>은 없는 경우 입력안해도 된다 (EAI 호출 제외 예시)"
		},
		core: {
			url: serviceInfCore,
			alt: '코어 연계 등록 예시',
			info: "<span class='color-text'>과거서비스CODE</span>와 <span class='color-text'>관련팀명</span>은 없는 경우 입력안해도 된다 (코어 연계 예시)"
		}
	};

	/**
	 * 버튼 클릭 시 이미지 및 정보 업데이트
	 */
	const showImg = (type: 'y' | 'n' | 'core'): void => {
		if (activeType === type) {
			// 이미 활성화된 버튼을 다시 클릭하면 토글하지 않고 유지
			return;
		}

		// 활성화 상태 업데이트
		activeType = type;
	};

	// 현재 선택된 이미지 정보 (파생 상태)
	const currentImageData = $derived(activeType ? imageMap[activeType] : null);
</script>

<!-- Main Layout -->
<div class="service-inf-block">
	<!-- Header -->
	<header class="service-inf__header">
		<div class="info-box">
			<span class="info-icon">ℹ️</span>
			<p>
				보편적인 경우에 해당하는 예시만 있으니 참고용으로만 사용하세요! (화면번호: 516252)<br />
				'과거서비스CODE'와 '관련팀명'은 없는 경우 입력안해도 됩니다!
			</p>
		</div>
	</header>

	<!-- Button Group -->
	<div class="button-group">
		<button class="service-inf-btn" class:active={activeType === 'y'} onclick={() => showImg('y')}>
			EAI 호출이 있는 경우
		</button>
		<button class="service-inf-btn" class:active={activeType === 'n'} onclick={() => showImg('n')}>
			EAI 호출이 없는 경우
		</button>
		<button
			class="service-inf-btn"
			class:active={activeType === 'core'}
			onclick={() => showImg('core')}
		>
			코어 연계의 경우
		</button>
	</div>

	<!-- Image and Info Display -->
	<div class="content-display">
		<!-- Image Area -->
		<div class="image-wrapper">
			{#if currentImageData}
				<img
					src={currentImageData.url}
					alt={currentImageData.alt}
					class="example-image"
				/>
			{:else}
				<div class="info-message">
					위에 있는 버튼 중 하나를 클릭하여 예시를 확인하세요.
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.service-inf-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		width: 100%;
		margin: 0 auto;
	}

	.service-inf__header {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.info-box {
		padding: 1rem 1.5rem;
		background: rgba(6, 182, 212, 0.1);
		border: 1px solid rgba(6, 182, 212, 0.2);
		border-radius: 0.75rem;
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.info-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.info-box p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: white;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.service-inf-btn {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(to right bottom, var(--color-secondary-1), var(--color-secondary-2));
		color: white;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.service-inf-btn:hover {
		background: linear-gradient(to right bottom, var(--color-secondary-1), var(--color-secondary-2));
		transform: translateY(-2px);
	}

	.service-inf-btn.active {
		background: linear-gradient(to right bottom, var(--color-primary-1), var(--color-primary-2));
		color: #ffffff;
	}

	.content-display {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.image-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		border-radius: 0.75rem;
		overflow: auto;
	}

	.example-image {
		width: auto;
		height: auto;
		max-width: 100%;
		border-radius: 0.5rem;
	}
</style>