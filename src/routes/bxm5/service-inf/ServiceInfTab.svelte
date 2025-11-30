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
			info: ''
		},
		n: {
			url: serviceInfEaiNo,
			alt: 'EAI 호출이 없는 경우 등록 예시',
			info: ''
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
			<p>
				ℹ️ 보편적인 경우에 해당하는 예시만 있으니 참고용으로만 사용하세요! (화면번호: 516252)
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

		<!-- Info Text -->
		{#if currentImageData?.info}
			<div class="info-wrapper">
				<p class="info-text">
					{@html currentImageData.info}
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.service-inf-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
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
		padding: 1.25rem 1.75rem;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		display: flex;
		gap: 0.875rem;
		align-items: flex-start;
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
	}

	.info-box p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.85);
		font-weight: 400;
	}

	.button-group {
		display: flex;
		gap: 0.875rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.service-inf-btn {
		position: relative;
		padding: 0.875rem 1.75rem;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.9);
		border-radius: 0.75rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.service-inf-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.3));
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.service-inf-btn:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.service-inf-btn:hover::before {
		opacity: 1;
	}

	.service-inf-btn.active {
		background: linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(239, 68, 68, 0.25));
		border-color: rgba(236, 72, 153, 0.5);
		color: #ffffff;
		box-shadow: 0 8px 32px rgba(236, 72, 153, 0.4);
	}

	.service-inf-btn.active::before {
		opacity: 0;
	}

	.content-display {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.image-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 1rem;
		overflow: auto;
	}

	.example-image {
		max-width: 100%;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.info-message {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.95rem;
		text-align: center;
		font-weight: 400;
	}

	.info-wrapper {
		width: 100%;
		display: flex;
		justify-content: center;
        padding: 2rem;
	}

	.info-text {
		margin: 0;
		padding: 1rem 1.75rem;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.9rem;
		text-align: center;
		line-height: 1.7;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.info-text :global(.color-text) {
		color: #ec4899;
		font-weight: 600;
		text-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
	}

	/* 반응형 디자인 */
	@media (max-width: 768px) {
		.service-inf-block {
			padding: 1rem;
			gap: 1.25rem;
		}

		.info-box {
			padding: 1rem 1.25rem;
		}

		.button-group {
			flex-direction: column;
			width: 100%;
			gap: 0.75rem;
		}

		.service-inf-btn {
			width: 100%;
		}

		.image-wrapper {
			min-height: 300px;
			padding: 1rem;
		}
	}
</style>