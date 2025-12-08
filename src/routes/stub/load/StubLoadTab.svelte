<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';

	import { stubStore } from '../store';
	import { StubWebSocketService } from '../websocket';
	import { StubTimerService } from '../TimerService';
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';
	import { showConfirm } from '$lib/components/ui/FloatingUI/confirmStore';

	import { ControlBar, CustomerNumberTags, WorkflowStatus, OutputLogs } from './components';
	import { useCustomerNumberInput } from './composables/useCustomerNumberInput.svelte';

	// ============ Services ============
	const ws = StubWebSocketService.getInstance();
	const timerService = StubTimerService.getInstance();
	const customerInput = useCustomerNumberInput();

	// ============ Derived State ============
	const connected = $derived($stubStore.connected);
	const sessionStatus = $derived($stubStore.sessionStatus);
	const workflow = $derived($stubStore.workflow);
	const outputLogs = $derived($stubStore.outputLogs);
	const serverHealth = $derived($stubStore.serverHealth);
	const totalTimer = $derived($stubStore.totalTimer);
	const step1Timer = $derived($stubStore.step1Timer);
	const step2Timer = $derived($stubStore.step2Timer);
	const step3Timer = $derived($stubStore.step3Timer);

	// 세션이 다른 사람에게 점유되었는지
	const isOccupiedByOthers = $derived(
		sessionStatus.active && sessionStatus.owner !== $stubStore.connectionId
	);

	// 원격 서버가 모두 정상인지
	const isServerHealthy = $derived(
		Object.values(serverHealth).every((health) => health.is_healthy)
	);

	// 작업 실행 가능 여부
	const canStart = $derived(
		connected && !sessionStatus.active && isServerHealthy && customerInput.hasNumbers
	);

	// 작업 진행 중인지
	const isWorkflowRunning = $derived(
		Object.values(workflow).some((status) => status === 'running')
	);

	// ============ Workflow Actions ============

	/**
	 * 작업 시작
	 */
	function startWorkflow(): void {
		if (!canStart) {
			if (!connected) {
				showNotification('error', 'WebSocket이 연결되지 않았습니다.');
			} else if (sessionStatus.active) {
				showNotification('error', '다른 사용자가 작업 중입니다.');
			} else if (!isServerHealthy) {
				showNotification('error', '박지현의 하이웨어가 아마 잠김 상태인듯?');
			} else if (!customerInput.hasNumbers) {
				showNotification('error', '고객번호를 입력해주세요.');
			}
			return;
		}

		stubStore.setCustomerNumbers(customerInput.customerNumbers);
		stubStore.resetWorkflow();
		stubStore.clearOutputLogs();
		stubStore.resetTimers();
		ws.startWorkflow(customerInput.customerNumbers);
	}

	/**
	 * 작업 중지
	 */
	async function stopWorkflow(skipConfirm = false): Promise<void> {
		if (!isWorkflowRunning) return;

		if (!skipConfirm) {
			const confirmed = await showConfirm({
				title: '작업 중지',
				message: '작업을 중지하시겠습니까?',
				type: 'danger',
				confirmText: '중지',
				cancelText: '취소'
			});
			if (!confirmed) return;
		}

		timerService.terminateAll();
		ws.endSession();

		stubStore.resetWorkflow();
		stubStore.resetTimers();
		stubStore.addOutputLog('[INFO] 사용자에 의해 작업이 중지되었습니다.\n');

		showNotification('success', '작업이 중지되었습니다.');
	}

	// ============ Lifecycle ============

	onMount(() => {
		const connectWebSocket = async () => {
			const wsUrl = PUBLIC_WEBSOCKET_URL + '/stub';
			await ws.connect(wsUrl);
		};

		connectWebSocket();

		// 브라우저 탭/창 닫기 전 확인
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isWorkflowRunning) {
				e.preventDefault();
				e.returnValue = '';
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			ws.close();
			timerService.terminateAll();
		};
	});

	// 페이지 이탈 전 확인 (SvelteKit 내부 네비게이션)
	beforeNavigate((navigation) => {
		if (!isWorkflowRunning) return;

		navigation.cancel();

		(async () => {
			if (!navigation.to || navigation.to.url.pathname === navigation.from?.url.pathname) {
				return;
			}

			const confirmed = await showConfirm({
				title: '작업 진행 중',
				message: '작업이 진행 중입니다. 페이지를 벗어나면 작업이 중단됩니다. 계속하시겠습니까?',
				type: 'warning',
				confirmText: '페이지 이동',
				cancelText: '취소'
			});

			if (confirmed) {
				await stopWorkflow(true);
				await goto(navigation.to.url.pathname);
			}
		})();
	});

	onDestroy(() => {
		stubStore.reset();
	});
</script>

<div class="container">
	<!-- 컨트롤 영역 -->
	<ControlBar
		{connected}
		{isServerHealthy}
		{isOccupiedByOthers}
		{sessionStatus}
		bind:inputCusno={customerInput.inputValue}
		inputValidationState={customerInput.validationState}
		{canStart}
		{isWorkflowRunning}
		onInputChange={customerInput.validateInput}
		onInputBlur={customerInput.addNumbers}
		onKeyDown={customerInput.handleKeyDown}
		onStart={startWorkflow}
		onStop={stopWorkflow}
	/>

	<!-- 고객번호 태그 영역 -->
	<CustomerNumberTags
		cusnoList={customerInput.customerNumbers}
		{isWorkflowRunning}
		onRemove={customerInput.removeNumber}
	/>

	<!-- 메인 작업 영역 -->
	<div class="main-content">
		<!-- 왼쪽: 작업 진행 상태 -->
		<WorkflowStatus
			{workflow}
			{totalTimer}
			{step1Timer}
			{step2Timer}
			{step3Timer}
			{isWorkflowRunning}
		/>

		<!-- 오른쪽: 실시간 출력 로그 -->
		<OutputLogs logs={outputLogs} />
	</div>
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 0;
	}

	.main-content {
		display: grid;
		grid-template-columns: 400px 1fr;
		gap: 1.5rem;
		flex: 1;
		min-height: 0;
	}

	@media (max-width: 1024px) {
		.main-content {
			grid-template-columns: 1fr;
		}
	}
</style>
