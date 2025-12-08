<script lang="ts">
	import { notification } from './notificationStore';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// 타입별 아이콘
	const icons = {
		info: 'ℹ️',
		success: '✅',
		warning: '⚠️',
		error: '❌'
	};

	// 타입별 색상
	const colors = {
		info: {
			bg: 'rgba(96, 165, 250, 0.15)',
			border: 'rgba(96, 165, 250, 0.6)',
			glow: 'rgba(96, 165, 250, 0.4)'
		},
		success: {
			bg: 'rgba(16, 185, 129, 0.15)',
			border: 'rgba(16, 185, 129, 0.5)',
			glow: 'rgba(16, 185, 129, 0.3)'
		},
		warning: {
			bg: 'rgba(245, 158, 11, 0.15)',
			border: 'rgba(245, 158, 11, 0.5)',
			glow: 'rgba(245, 158, 11, 0.3)'
		},
		error: {
			bg: 'rgba(239, 68, 68, 0.15)',
			border: 'rgba(239, 68, 68, 0.5)',
			glow: 'rgba(239, 68, 68, 0.3)'
		}
	};

	function closeNotification() {
		notification.set({ type: 'info', message: '', visible: false });
	}
</script>

{#if $notification.visible}
	<div
		class="notification-container"
		transition:fly={{ y: -20, duration: 400, easing: quintOut }}
		style="
			--bg-color: {colors[$notification.type].bg};
			--border-color: {colors[$notification.type].border};
			--glow-color: {colors[$notification.type].glow};
		"
	>
		<div class="notification-icon">
			{icons[$notification.type]}
		</div>
		<div class="notification-content">
			{@html $notification.message}
		</div>
		<button class="close-btn" onclick={closeNotification} aria-label="Close notification">
			✕
		</button>
	</div>
{/if}

<style>
	.notification-container {
		position: fixed;
		top: 24px;
		left: 50%;
		transform: translateX(-50%);

		display: flex;
		align-items: center;
		gap: 1rem;

		min-width: 320px;
		max-width: 480px;
		padding: 1rem 1.25rem;

		background: var(--bg-color);
		backdrop-filter: blur(12px);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset,
			0 0 30px var(--glow-color);

		z-index: 9999;

		animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.notification-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.notification-content {
		flex: 1;
		color: white;
		font-size: 0.9375rem;
		font-weight: 500;
		line-height: 1.5;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.close-btn {
		flex-shrink: 0;
		width: 28px;
		height: 28px;

		display: flex;
		align-items: center;
		justify-content: center;

		background: transparent;
		border: none;
		border-radius: 50%;

		color: rgba(255, 255, 255, 0.7);
		font-size: 1.125rem;
		font-weight: 400;
		line-height: 1;
		cursor: pointer;

		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		color: white;
		transform: scale(1.15);
	}

	.close-btn:active {
		transform: scale(0.95);
	}

	@media (max-width: 640px) {
		.notification-container {
			min-width: auto;
			max-width: calc(100vw - 48px);
			margin: 0 24px;
		}
	}
</style>
