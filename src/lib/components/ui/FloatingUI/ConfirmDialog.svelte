<script lang="ts">
	import { confirmState, closeConfirm } from './confirmStore';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// 타입별 색상
	const typeColors = {
		info: {
			icon: '❓',
			color: '#3B82F6',
			glow: 'rgba(59, 130, 246, 0.3)'
		},
		warning: {
			icon: '⚠️',
			color: '#F59E0B',
			glow: 'rgba(245, 158, 11, 0.3)'
		},
		danger: {
			icon: '❌',
			color: '#EF4444',
			glow: 'rgba(239, 68, 68, 0.3)'
		}
	};

	function handleConfirm() {
		closeConfirm(true);
	}

	function handleCancel() {
		closeConfirm(false);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleCancel();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleCancel();
		} else if (e.key === 'Enter') {
			handleConfirm();
		}
	}
</script>

{#if $confirmState.visible}
	<div
		class="backdrop"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="presentation"
	>
		<div
			class="dialog"
			transition:scale={{ duration: 300, start: 0.95, easing: quintOut }}
			role="dialog"
			aria-labelledby="dialog-title"
			aria-describedby="dialog-message"
			style="--type-color: {typeColors[$confirmState.type || 'info'].color}; --type-glow: {typeColors[
				$confirmState.type || 'info'
			].glow}"
		>
			<!-- Icon -->
			<div class="icon">
				{typeColors[$confirmState.type || 'info'].icon}
			</div>

			<!-- Content -->
			<div class="content">
				<h3 id="dialog-title" class="title">{$confirmState.title}</h3>
				<p id="dialog-message" class="message">{$confirmState.message}</p>
			</div>

			<!-- Buttons -->
			<div class="buttons">
				<button class="btn btn-cancel" onclick={handleCancel}>
					{$confirmState.cancelText}
				</button>
				<button class="btn btn-confirm" onclick={handleConfirm}>
					{$confirmState.confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	}

	.dialog {
		background: rgba(30, 30, 40, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset,
			0 0 50px var(--type-glow);

		width: 90%;
		max-width: 440px;
		padding: 2rem;

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.icon {
		font-size: 3rem;
		line-height: 1;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
		animation: iconPulse 2s ease-in-out infinite;
	}

	@keyframes iconPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	.content {
		text-align: center;
		width: 100%;
	}

	.title {
		margin: 0 0 0.75rem 0;
		color: white;
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.message {
		margin: 0;
		color: rgba(255, 255, 255, 0.85);
		font-size: 1rem;
		line-height: 1.6;
	}

	.buttons {
		display: flex;
		gap: 0.75rem;
		width: 100%;
	}

	.btn {
		flex: 1;
		padding: 0.875rem 1.5rem;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.9375rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-cancel {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
	}

	.btn-cancel:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.btn-confirm {
		background: linear-gradient(135deg, var(--type-color) 0%, color-mix(in srgb, var(--type-color), black 20%) 100%);
		color: white;
		box-shadow: 0 4px 16px var(--type-glow);
	}

	.btn-confirm:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px var(--type-glow);
	}

	.btn:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.dialog {
			width: calc(100% - 2rem);
			padding: 1.5rem;
		}

		.icon {
			font-size: 2.5rem;
		}

		.title {
			font-size: 1.25rem;
		}

		.message {
			font-size: 0.9375rem;
		}

		.buttons {
			flex-direction: column-reverse;
		}

		.btn {
			width: 100%;
		}
	}
</style>
