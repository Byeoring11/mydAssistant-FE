<script lang="ts">
	import { goto } from '$app/navigation';

	interface ServiceCard {
		path: string;
		title: string;
		description: string;
		icon: string;
		gradient: string;
	}

	const services: ServiceCard[] = [
		{
			path: '/stub',
			title: '대응답 적재',
			description: '대응답 데이터를 자동으로 적재하고 이력을 관리합니다',
			icon: '📦',
			gradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(139, 92, 246, 0.15))'
		},
		{
			path: '/bxm5',
			title: 'BXM5',
			description: 'BXM5 개발 도구 및 유틸리티를 제공합니다',
			icon: '⚡',
			gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))'
		},
		{
			path: '/bxm4',
			title: 'BXM4',
			description: 'BXM4 개발 도구 및 유틸리티를 제공합니다',
			icon: '🔧',
			gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.15))'
		},
		{
			path: '/diff',
			title: 'Diff 체크',
			description: '파일 및 데이터 비교 도구를 제공합니다',
			icon: '📊',
			gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.15))'
		},
		{
			path: '/utils',
			title: 'Utils',
			description: '개발에 유용한 다양한 유틸리티 도구를 제공합니다',
			icon: '🛠️',
			gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.15))'
		},
		{
			path: '/patchnote',
			title: 'Patch Note',
			description: '업데이트 및 패치 이력을 타임라인으로 관리합니다',
			icon: '📝',
			gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))'
		}
	];

	function navigateTo(path: string) {
		goto(path);
	}
</script>

<svelte:head>
	<title>Mydata Assistant - Home</title>
	<meta name="description" content="An assistant of mydata cell for helping work" />
</svelte:head>

<div class="home-container">
	<!-- Hero Section -->
	<div class="hero-section">
		<h1 class="hero-title">Mydata Assistant</h1>
		<p class="hero-subtitle">마이데이터 개발을 위한 올인원 툴킷</p>
	</div>

	<!-- Services Grid -->
	<div class="services-grid">
		{#each services as service}
			<button class="service-card" onclick={() => navigateTo(service.path)}>
				<div class="card-glow" style="background: {service.gradient}"></div>
				<div class="card-content">
					<div class="icon">{service.icon}</div>
					<h2 class="title">{service.title}</h2>
					<p class="description">{service.description}</p>
					<div class="arrow">→</div>
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.home-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1rem;
		min-height: calc(100vh - 4rem);
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	/* Hero Section */
	.hero-section {
		text-align: center;
		padding: 3rem 0;
		animation: fadeIn 0.8s ease;
	}

	.hero-title {
		font-size: 3.5rem;
		font-weight: 800;
		margin: 0 0 1rem 0;
		background: linear-gradient(
			135deg,
			rgba(96, 165, 250, 1),
			rgba(139, 92, 246, 1),
			rgba(236, 72, 153, 1)
		);
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		font-weight: 400;
	}

	/* Services Grid */
	.services-grid {
		display: flex;
		gap: 1.5rem;
		animation: slideUp 0.8s ease 0.2s both;
		justify-content: center;
		flex-wrap: wrap;
	}

	.service-card {
		position: relative;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 0;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 200px;
		flex: 1 1 180px;
		max-width: 220px;
		display: flex;
		flex-direction: column;
	}

	.card-glow {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 0;
	}

	.service-card:hover .card-glow {
		opacity: 1;
	}

	.service-card:hover {
		transform: translateY(-8px) scale(1.02);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.3),
			0 0 60px rgba(96, 165, 250, 0.2);
	}

	.card-content {
		position: relative;
		z-index: 1;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		flex: 1;
	}

	.icon {
		font-size: 3rem;
		line-height: 1;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		color: white;
		background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8));
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
	}

	.description {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.6;
		margin: 0;
		flex: 1;
	}

	.arrow {
		font-size: 1.5rem;
		color: rgba(255, 255, 255, 0.4);
		transition: transform 0.3s ease;
		align-self: flex-end;
	}

	.service-card:hover .arrow {
		transform: translateX(4px);
		color: rgba(255, 255, 255, 0.8);
	}

	/* Quick Stats */
	.stats-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		animation: slideUp 0.8s ease 0.4s both;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		transition: all 0.3s ease;
	}

	.stat-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: 800;
		background: linear-gradient(135deg, rgba(96, 165, 250, 1), rgba(139, 92, 246, 1));
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
	}

	/* Animations */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.services-grid {
			grid-template-columns: 1fr;
		}

		.stats-section {
			grid-template-columns: 1fr;
		}
	}
</style>
