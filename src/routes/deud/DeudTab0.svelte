<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { flip } from 'svelte/animate';
	import { beforeNavigate } from '$app/navigation';

	import { send, receive } from '$lib/utils/transition/crossfade';
	import XIcon from '$lib/components/svg/icons/XIcon.svelte';
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';

	import LoadingBox from './LoadingBox.svelte';
	import { CusnoValidator } from './modules/CusnoValidator';
	import { TaskManager } from './modules/TaskManager';
	import { WebSocketService } from './services/WebSocketService';
	import { taskStore } from './store/TaskStore';
    
	/**
	 *  *========================================================================
	 *  *==================== 고객번호 조작 관련 Script ===========================
	 *  *========================================================================
	 */ 
	let inputCusno		: string   = $state("");
	let validCusnoList	: string[] = $state([]);
	let invalidCusnoList: string[] = $state([]);

	/**
	 * 고객번호 검증 함수
	 * - onInput 이벤트 발생 시 호출
	 */
	const validateCusno = (): void => {
		const _validCusnoList = CusnoValidator.extractValidCusno(inputCusno);
		validCusnoList = [...new Set([...validCusnoList, ..._validCusnoList])];
  		invalidCusnoList = CusnoValidator.extractInvalidCusno(inputCusno);
        inputCusno = CusnoValidator.removeCompletedCusno(inputCusno, _validCusnoList);
	};

	/**
	 * 고객번호 입력창 초기화 함수
	 * - onChange 이벤트 발생 시 호출
	 * - 유효하지 않은 고객번호 초기화 전 Notification 발생
	 * - 유효하지 않은 고객번호 리스트 초기화
	 */
	const resetInputCusno = (): void => {
		showNotification("warning", `올바르지 않은 형식의 고객번호 ${invalidCusnoList.length}개 제외 <br/> ${invalidCusnoList.join(', ')}`);
		inputCusno = "";
		invalidCusnoList = [];
	};

	/**
	 * 고객번호 태그 제거 함수
	 * - x 버튼 클릭 시 호출
	 * @param index
	 */
	const removeCusnoTag = (index: number) => (event: MouseEvent): void => {
		validCusnoList = validCusnoList.filter((_, i) => i !== index);
	};

    /**
	 *  *========================================================================
	 *  *==================== 대응답 프로세스 관련 Script =========================
	 *  *========================================================================
	 */
	let taskManager: TaskManager | null = $state(null);

	onMount(async () => {
		await WebSocketService.getInstance().connect("ws://172.30.1.42/ws");
		taskManager = new TaskManager();
	});

	const startTask = async () => {
		await taskManager?.launchDeud();
	}

	const cancelTask = async () => {
		await taskManager?.cancelOngoingTask();
	}

	beforeNavigate((navigation) => {
		if (get(taskStore).runningState) {
			if(!confirm("진행 중인 작업이 있습니다. 페이지를 이동하시겠습니까?")) {
				navigation.cancel();
			}
		}
	});

	onDestroy(async() => {
		// await taskManager?.cancelOngoingTask();
		await WebSocketService.getInstance().close();
		await taskManager?.initTaskStore();
	});
</script>

<!-- 1. 고객번호 영역 Start-->
<div class="deud-block">
    <!-- 1.1 고객번호 입력 영역-->
    <div class="cusno-block">
        <!-- 1.1.1 고객번호 입력 영역-->
        <div class="cusno-block__input-wrap">
            <input 
                class="cusno-block__input-wrap__input"
                type="text"
                placeholder="고객번호 입력"
                bind:value={inputCusno}
                oninput={validateCusno}
                onchange={resetInputCusno}
            />
        </div>
		
		<div class="ws-state-block">
			<div class="ws-state-block__dot" class:running-state={!$taskStore.taskState}></div>
			<span class="ws-state-block__text">
				{#if $taskStore.taskState}
				대응답 적재 가능
				{:else if !$taskStore.taskState && $taskStore.runningState}
				대응답 진행 중
				{:else if !$taskStore.taskState && !$taskStore.runningState}
				다른 사용자가 대응답 적재 중
				{/if}
			</span>
		</div>
    </div>
    <!-- 1.2 고객번호 리스트 태그 영역 -->
    <div class="cusno-block">
        {#each validCusnoList as cusno, index (cusno)}
            <div class="cusno-block__tag" in:receive={{ key: cusno }} animate:flip={{ duration: 350 }}>
                <span class="cusno-block__tag__text">{cusno}</span>
                <button class="cusno-block__tag__button" onclick={removeCusnoTag(index)}>
                    <XIcon size={10}/>
                </button>
            </div>
        {/each}
    </div>
</div>
<!-- 1. 고객번호 영역 End -->

<!-- 2. 대응답 진행 상태 & 로딩 영역 Start-->
<div class="deud-block">
    <div class="step-block">
        <LoadingBox serverType={1} state={$taskStore.loadingState[0]}/>
        <LoadingBox serverType={2} state={$taskStore.loadingState[1]}/>
        <LoadingBox serverType={3} state={$taskStore.loadingState[2]}/>
    </div>
</div>
<!-- 2. 대응답 진행 상태 & 로딩 영역 End-->

<div class="deud-block"></div>

<!-- 3. 대응답 시작 버튼 영역 Start -->
<div class="deud-block">
    <div class="launch-block">
        <button class="launch-block__button" onclick={startTask}>
            <span class="launch-block__button__text">대응답 Launch!</span>
        </button>
		{#if $taskStore.runningState}
		<button class="launch-block__button" onclick={cancelTask}>
            <span class="launch-block__button__text">대응답 중단하기</span>
        </button>
		{/if}
    </div>
	
</div>
<!-- 3. 대응답 시작 버튼 영역 End -->

<style>
	@keyframes gradient {
		0% {
			background-position: 0 0;
		}
		100% {
			background-position: 100% 0;
		}
	}

    .deud-block {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
    }

    .cusno-block {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.7rem;
		flex-wrap: wrap;
	}

	.cusno-block__input-wrap {
		position: relative;
		width: 100%;
		max-width: 25rem;
		padding: 8px 16px;
        border-radius: 8px;
		background: linear-gradient(to right bottom, var(--color-bg-1), var(--color-bg-2));
	}

	.cusno-block__input-wrap::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 3%;
		height: 3%;
		background: linear-gradient(to right, #ff94e4, #57e6e6, #feffb8, #57e6e6, #ff94e4, #57e6e6);
		background-position: 0% 0%;
		background-size: 500% auto;
		animation: gradient 3s linear infinite;
		transition: height 0.2s ease-out, border-radius 0.3s ease-in;
	}
	
	.cusno-block__input-wrap:focus-within::after {
		height: 100%;
		border-radius: 0.5rem;
		transition: height 0.2s ease-out, border-radius 0.3s ease-in;
		z-index: -1;
	}

	.cusno-block__input-wrap__input {
		width: 100%;
		border-style: none;
		outline: none;
		background: transparent;
		color: var(--color-text-1);
	}

	.cusno-block__input-wrap__input::-webkit-input-placeholder {
		color: var(--color-text-3);
	}

	.cusno-block__input-wrap__input:focus {
		font-weight: bold;
		color: var(--color-bg-0);
	}

	.cusno-block__input-wrap__input:focus::-webkit-input-placeholder {
		color: var(--color-bg-0);
	}

	.cusno-block__tag {
		width: max-content;
		padding: 0.3rem 0.8rem;
		border-radius: 0.8rem;
		background-position: 0% 0%;
		background: linear-gradient(135deg, #ff94e4, #57e6e6, #feffb8, #57e6e6, #ff94e4, #57e6e6);
		background-size: 500% auto;
		animation: gradient 3s linear infinite;
		display: flex;
		justify-content: center;
		flex-direction: row;
	}

	.cusno-block__tag__text {
		color: var(--color-bg-0);
		font-weight: bold;
		font-size: 0.9rem;
		font-variant-numeric: tabular-nums;
	}

	.cusno-block__tag__button {
		border-style: none;
		background: transparent;
		outline: none;
		cursor: pointer;
		padding-left: 0.3rem;
		line-height: 1rem;
	}

	.ws-state-block {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.ws-state-block__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		position: relative;
		box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
		animation: glow 1s infinite alternate;
		background-color: #00ff00; /* 초록색 */
 		box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00;
	}

	.ws-state-block__dot.running-state {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		position: relative;
		box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
		animation: glow 1s infinite alternate;
		background-color: #FF3131; /* 초록색 */
 		box-shadow: 0 0 10px #FF3131, 0 0 20px #FF3131, 0 0 30px #FF3131, 0 0 40px #FF3131;
	}

	@keyframes glow {
		0% {
			opacity: 0.4;
		}
		100% {
			opacity: 1;
		}
	}

	.step-block {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
	}
	
	.launch-block__button {
		position: relative;
		cursor: pointer;
		width: 10rem;
		height: 3rem;
		border-radius: 10rem;
		border-style: none;
		transition: 0.5s transform;
		outline: none;
		background: linear-gradient(to right bottom, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
	}

	.launch-block__button::before {
		content: '';
		z-index: 1;
		position: absolute;
		width: 80%;
		height: 70%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transition: 0.3s opacity ease-in-out;
		filter: blur(25px);
		opacity: 0.3;
		background: linear-gradient(to right bottom, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
	}

	.launch-block__button:hover {
		transform: scale(0.95);
		transition: 0.5s transform;
	}

	.launch-block__button:hover::before {
		opacity: 1;
		transition: 0.3s opacity ease-in-out;
		background: linear-gradient(to right bottom, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82); 
	}

	.launch-block__button__text {
		position: absolute;
		text-align: center;
		line-height: 2.5rem;
		font-size: 1.2rem;
		color: var(--color-text-1);
		z-index: 2;
		border-radius: 10rem;
		width: 95%;
		height: 85%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: rgba(18, 18, 18, 0.98);
	}
</style>