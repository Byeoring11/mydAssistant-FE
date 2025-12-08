<script lang="ts">
	import type { WorkflowState, TimerState } from '../../types';
	import { getStepIcon, getStepColor, WORKFLOW_STEPS } from '../constants';

	interface Props {
		workflow: WorkflowState;
		totalTimer: TimerState;
		step1Timer: TimerState;
		step2Timer: TimerState;
		step3Timer: TimerState;
		isWorkflowRunning: boolean;
	}

	let { workflow, totalTimer, step1Timer, step2Timer, step3Timer, isWorkflowRunning }: Props =
		$props();

	const stepTimers = $derived({
		step1: step1Timer,
		step2: step2Timer,
		step3: step3Timer
	});
</script>

<div class="workflow-section">
	<div class="workflow-header">
		<h3>작업 진행 상태</h3>
		{#if isWorkflowRunning || totalTimer.min !== '00' || totalTimer.sec !== '00' || totalTimer.msec !== '00'}
			<div class="timer">{totalTimer.min}:{totalTimer.sec}:{totalTimer.msec}</div>
		{/if}
	</div>

	<div class="workflow-steps">
		{#each WORKFLOW_STEPS as step, index}
			{#if index > 0}
				<div class="step-arrow">↓</div>
			{/if}

			<div
				class="step-item"
				class:running={workflow[step.key] === 'running'}
				class:success={workflow[step.key] === 'success'}
				class:error={workflow[step.key] === 'error'}
				style="--step-color: {getStepColor(workflow[step.key])}"
			>
				<div class="step-icon">{getStepIcon(workflow[step.key])}</div>
				<div class="step-content">
					<div class="step-title">{step.title}</div>
					<div class="step-desc">{step.description}</div>
					<div class="step-timer">
						{stepTimers[step.key].min}:{stepTimers[step.key].sec}:{stepTimers[step.key].msec}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	/* 작업 진행 상태 */
	.workflow-section {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
	}

	.workflow-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.workflow-header h3 {
		margin: 0;
		font-size: 1.3rem;
		font-weight: 600;
		background: linear-gradient(
			to right bottom,
			rgba(96, 165, 250, 0.9),
			rgba(139, 92, 246, 0.9)
		);
		background-clip: text;
		color: transparent;
	}

	.timer {
		font-size: 1.3rem;
		font-weight: 700;
		color: #60a5fa;
		letter-spacing: 0.1em;
		font-variant-numeric: tabular-nums;
	}

	.workflow-steps {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.step-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* Running 상태 - 빛나는 glassmorphism */
	.step-item.running {
		position: relative;
		overflow: hidden;
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(139, 92, 246, 0.12));
		backdrop-filter: blur(12px);
		border: 1px solid rgba(96, 165, 250, 0.35);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.15),
			0 0 20px rgba(96, 165, 250, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.step-item.running::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: 10px;
		background: conic-gradient(
			from 0deg,
			transparent,
			#60a5fa80,
			rgba(139, 92, 246, 0.5),
			transparent 75%
		);
		z-index: 0;
		animation: rotateGlow 3s linear infinite;
		filter: blur(6px);
	}

	.step-item.running::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 10px;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
		z-index: 1;
	}

	/* 내부 컨텐츠는 z-index 올려서 정상적으로 보이게 */
	.step-item.running > * {
		position: relative;
		z-index: 2;
	}

	/* Success 상태 - 완료 glassmorphism */
	.step-item.success {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
		backdrop-filter: blur(10px);
		border: 1px solid rgba(16, 185, 129, 0.3);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.1),
			0 0 15px rgba(16, 185, 129, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Error 상태 - 에러 glassmorphism */
	.step-item.error {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
		backdrop-filter: blur(10px);
		border: 1px solid rgba(239, 68, 68, 0.3);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.1),
			0 0 15px rgba(239, 68, 68, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* 애니메이션 정의 */
	@keyframes rotateGlow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.step-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--step-color, rgba(255, 255, 255, 0.1));
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		color: white;
		font-weight: 700;
	}

	.step-content {
		flex: 1;
	}

	.step-title {
		font-weight: 600;
		color: white;
		margin-bottom: 0.25rem;
	}

	.step-desc {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.step-timer {
		font-size: 0.875rem;
		font-weight: 600;
		color: #60a5fa;
		margin-top: 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	.step-arrow {
		text-align: center;
		color: rgba(255, 255, 255, 0.3);
		font-size: 1.5rem;
		margin: 0.25rem 0;
	}
</style>
