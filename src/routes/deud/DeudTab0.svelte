<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { beforeNavigate } from '$app/navigation';

	import { send, receive } from '$lib/utils/transition/crossfade';
	import { Server } from '$lib/constants/server';
	import XIcon from '$lib/components/svg/icons/XIcon.svelte';
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';

	import { Timer, timerListStore } from './Timer';
	import LoadingBox from './LoadingBox.svelte';
	import { CusnoValidator } from './CusnoValidator';

    /**
     * 고객번호 관련 Script
     */
	let inputCusno		: string   = $state("");
	let validCusnoList	: string[] = $state([]);
	let invalidCusnoList: string[] = $state([]);

	const validateCusno = (): void => {
		const _validCusnoList = CusnoValidator.extractValidCusno(inputCusno);
  		invalidCusnoList = CusnoValidator.extractInvalidCusno(inputCusno);
		validCusnoList = [...new Set([...validCusnoList, ..._validCusnoList])];
        
        inputCusno = CusnoValidator.removeCompletedCusno(inputCusno, _validCusnoList);
	};

	const resetInputCusno = (): void => {
		inputCusno = "";
		invalidCusnoList = [];
	};

	const removeCusnoTag = (index: number) => (event: MouseEvent): void => {
		validCusnoList = validCusnoList.filter((_, i) => i !== index);
	};

    /**
     * 대응답 동작 관련 Script
     */
	onMount(() => {
		const timer1 = new Timer('wdexpa1p');
		const timer2 = new Timer('edwap1t');
		const timer3 = new Timer('mypap1d');
		
		timerListStore.set({
			'wdexpa1p': timer1,
			'edwap1t': timer2,
			'mypap1d': timer3,
		});
	});

	let runningState: boolean = $state(false);
	let loadingState: number[] = $state([1, 1, 1]);

	const resetTimers = async () => {
		Object.values($timerListStore).forEach(timer => timer.reset())
	};

	const terminateTimers = async () => {
		Object.values($timerListStore).forEach(timer => timer.terminate());
	};

	const resetLoadingState = async () => {
		loadingState = [1, 1, 1];
	};

	let executeTask = async (serverType: number): Promise<void> => {
		return new Promise((resolve, reject) => {

			let serverName = Server[serverType];
			
			$timerListStore[serverName].start();
			loadingState[serverType - 1] = 2;
	
			let logs: string[] = [];
			const socket = new WebSocket("ws://172.30.1.42:80/ws");
	
			socket.onopen = () => {
				console.log("WebSocket 연결 성공, readyState:", socket.readyState);
	
				socket.send(JSON.stringify({ type: "start", serverType }));
			};
	
			// WebSocket 메시지 수신
			socket.onmessage = (event) => {
				const message = event.data;
	
				if (message.startsWith("PROCESS_COMPLETED:")) {
					// 셸 명령 완료 시 타이머 중지 및 로딩 상태 업데이트
					$timerListStore[serverName].stop();
					loadingState[serverType - 1] = 3;
					socket.close(); // WebSocket 연결 종료
				} else if (message.startsWith("PROCESS_STOPPED:")) {
					// 셸 명령 중지 시 타이머 중지 및 로딩 상태 업데이트
					$timerListStore[serverName].stop();
					loadingState[serverType - 1] = 9;
					socket.close(); // WebSocket 연결 종료
				} else if (message.startsWith("PROCESS_ERROR:")) {
					// 셸 명령 에러 시 타이머 중지 및 로딩 상태 업데이트
					$timerListStore[serverName].stop();
					loadingState[serverType - 1] = 9;
					console.error("Shell process encountered an error:", message);
					socket.close(); // WebSocket 연결 종료
				} else if (message.startsWith("ERROR: Another")) {
					$timerListStore[serverName].stop();
					loadingState[serverType - 1] = 1;
					reject();
				} else {
					logs = [...logs, message]; // 로그 업데이트
					console.log(logs);
				}
			};
	
			// WebSocket 에러 처리
			socket.onerror = () => {
				console.error("WebSocket 연결 오류 발생");
				$timerListStore[serverName].stop();
				loadingState[serverType - 1] = 9;
				socket.close();
			};
	
			socket.onclose = () => {
				console.log("WebSocket 연결 종료");
				resolve();
			}
		})
	};

	let launchDeud = async () => {
		if (runningState) {
			showNotification("진행 중인 작업이 있습니다.");
			return;
		}

		runningState = true;
		await resetTimers();
		await resetLoadingState();
		try {
			await executeTask(1);
			await executeTask(2);
			await executeTask(3);
		} catch (error: any) {
			showNotification("다른 사용자가 이미 사용하고 있습니다.");
		}
		runningState = false;
	}; 

	beforeNavigate((navigation) => {
		if (runningState) {
			if(!confirm("진행 중인 작업이 있습니다. 페이지를 이동하시겠습니까?")) {
				navigation.cancel();
			}
		}
	});

	onDestroy(() => {
		terminateTimers();
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
        <LoadingBox serverType={1} state={loadingState[0]}/>
        <LoadingBox serverType={2} state={loadingState[1]}/>
        <LoadingBox serverType={3} state={loadingState[2]}/>
    </div>
</div>
<!-- 2. 대응답 진행 상태 & 로딩 영역 End-->

<div class="deud-block"></div>

<!-- 3. 대응답 시작 버튼 영역 Start -->
<div class="deud-block">
    <div class="launch-block">
        <button class="launch-block__button" onclick={launchDeud}>
            <span class="launch-block__button__text">대응답 Launch!</span>
        </button>
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

	.launch-block__button:active {
		transform: scale(0.95);
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