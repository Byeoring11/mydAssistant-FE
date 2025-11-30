<script lang="ts">
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';
    import {
        generateSeparatedServiceCode,
        generateSeparatedBeanCode,
        generateIntegratedServiceCode,
        createTemplateParams
    } from './source-templates'
    // 상태 관리
    let trxCd = $state('');
    let logicNm = $state('');
    let author = $state('');
    let eaiNm = $state('');
    let isBeanSeparated = $state(false); // Bean 분리 여부 체크박스 상태
    let isLoading = $state(false);
    
    // 생성된 코드 상태
    let serviceCode = $state('');
    let beanCode = $state('');
    let showResults = $state(false);

    // 복사 상태 관리
    let copyState = $state<{ service: boolean; bean: boolean }>({ service: false, bean: false });

    // 입력 필드 참조
    let trxCdInput: HTMLInputElement;
    let logicNmInput: HTMLInputElement;
    let authorInput: HTMLInputElement;

    // Service 거래코드 정규식 (RS로 시작)
    const TRX_CD_REGEX = /^RSMPM\d{4}[A-Z]\d{2}$/;
    const TRX_CD_PLACEHOLDER = 'RSMPM0000A00';

    /**
     * 입력값 유효성 검증
     */
    const validateInput = (): boolean => {
        if (!TRX_CD_REGEX.test(trxCd)) {
            showNotification('error', `유효하지 않은 Service 거래코드입니다.<br>형식: ${TRX_CD_PLACEHOLDER}`);
            trxCd = '';
            trxCdInput?.focus();
            return false;
        }
        if (logicNm.trim().length === 0) {
            showNotification('error', 'LogicalName을 입력해주세요.');
            logicNmInput?.focus();
            return false;
        }
        if (author.trim().length === 0) {
            showNotification('error', 'Author를 입력해주세요.');
            authorInput?.focus();
            return false;
        }
        return true;
    };

    /**
     * 거래코드 대문자 변환
     */
    const handleTrxCdInput = (e: Event): void => {
        const target = e.target as HTMLInputElement;
        trxCd = target.value.toUpperCase();
    };

    /**
     * 소스 생성
     */
    const generateSource = async (): Promise<{ service: string; bean: string }> => {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const params = createTemplateParams(
            trxCd,
            logicNm,
            author,
            eaiNm
        );

        if (isBeanSeparated) {
            return {
                service: generateSeparatedServiceCode(params),
                bean: generateSeparatedBeanCode(params)
            }
        } else {
           return {
                service: generateIntegratedServiceCode(params),
                bean: ''
           }
        }
    };

    /**
     * 소스 생성 실행
     */
    const generate = async (): Promise<void> => {
        if (!validateInput()) return;

        isLoading = true;
        showResults = false;
        serviceCode = '';
        beanCode = '';

        try {
            const result = await generateSource();
            serviceCode = result.service;
            beanCode = result.bean;
            showResults = true;
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', '생성에 실패했습니다.');
        } finally {
            isLoading = false;
        }
    };

    /**
     * 토글 변경 시 소스 재생성
     */
    const handleToggleChange = async (): Promise<void> => {
        // 결과가 표시되어 있을 때만 재생성
        if (!showResults) return;
        
        await generate();
    };

    /**
     * 코드 복사
     */
    const copyCode = async (type: 'service' | 'bean'): Promise<void> => {
        const text = type === 'service' ? serviceCode : beanCode;
        if (!text) return;
        
        try {
            await navigator.clipboard.writeText(text);
            copyState[type] = true;
            setTimeout(() => {
                copyState[type] = false;
            }, 2000);
        } catch (error) {
            alert('복사에 실패했습니다.');
        }
    };

    const handleReset = (): void => {
        trxCd = '';
        logicNm = '';
        author = '';
        eaiNm = '';
        serviceCode = '';
        beanCode = '';
        showResults = false;
    };
</script>

<div class="gen-source-block">
    <div class="bg-effects">
        <div class="bg-blob bg-blob-pink"></div>
        <div class="bg-blob bg-blob-cyan"></div>
        <div class="bg-blob bg-blob-purple"></div>
    </div>

    <!-- 
      content-wrapper: 
      - 기본 상태: 좁은 폭 (32rem)
      - 결과(showResults) + 분리모드(isBeanSeparated): 넓은 폭 (80rem)
      - 결과(showResults) + 통합모드(!isBeanSeparated): 중간 폭 (48rem)
    -->
    <div 
        class="content-wrapper" 
        class:expanded-wide={showResults && isBeanSeparated}
        class:expanded-narrow={showResults && !isBeanSeparated}
    >
        
        <!-- Input Section -->
        <div class="card glass-card input-section">
            <div class="header">
                <div class="header-dot"></div>
                <h2>BXM5 소스 생성기</h2>
            </div>
            
            <p class="description">
                거래코드를 입력하고 옵션을 선택하세요.
            </p>

            <div class="form-fields">
                <div class="field-group">
                    <label for="trxCd">Service 거래코드</label>
                    <div class="input-wrapper">
                        <input
                            id="trxCd"
                            type="text"
                            bind:this={trxCdInput}
                            bind:value={trxCd}
                            oninput={handleTrxCdInput}
                            placeholder={TRX_CD_PLACEHOLDER}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div class="field-group">
                    <label for="logicNm">LogicalName</label>
                    <div class="input-wrapper">
                        <input
                            id="logicNm"
                            type="text"
                            bind:this={logicNmInput}
                            bind:value={logicNm}
                            placeholder="[업무] 상세 서비스 설명"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div class="row-group-custom">
                    <div class="field-group">
                        <label for="author">Author</label>
                        <div class="input-wrapper">
                            <input
                                id="author"
                                type="text"
                                bind:this={authorInput}
                                bind:value={author}
                                placeholder="사번/이름"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div class="field-group">
                        <label for="eaiNm">EAI (Optional)</label>
                        <div class="input-wrapper">
                            <input
                                id="eaiNm"
                                type="text"
                                bind:value={eaiNm}
                                placeholder="EAI 없으면 거래코드로 IN/OUT 생성"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                <!-- Checkbox Toggle Area -->
                <div class="toggle-area">
                    <label class="toggle-switch">
                        <input type="checkbox" bind:checked={isBeanSeparated} disabled={isLoading} onchange={handleToggleChange}>
                        <span class="slider"></span>
                    </label>
                    <div class="toggle-label">
                        <span class="label-title">Bean 코드 분리 생성</span>
                        <span class="label-desc">
                            {isBeanSeparated ? 'Service와 Bean 파일을 각각 생성합니다.' : 'Service 파일 내에 비즈니스 로직을 통합합니다.'}
                        </span>
                    </div>
                </div>

            </div>

            <div class="button-group">
                <button class="btn btn-primary" onclick={generate} disabled={isLoading}>
                    <span class="btn-glow"></span>
                    <span class="btn-content">
                        {#if isLoading}
                            <span class="spinner"></span> Generating...
                        {:else}
                            ✨ 코드 생성하기
                        {/if}
                    </span>
                </button>
                <button class="btn btn-secondary" onclick={handleReset} disabled={isLoading}>
                    <span class="btn-content">↺ 초기화</span>
                </button>
            </div>
        </div>

        <!-- Results Section -->
        {#if showResults}
            <!-- 
                Grid Layout:
                - isBeanSeparated true: 2 columns
                - isBeanSeparated false: 1 column
            -->
            <div class="results-container" class:single-col={!isBeanSeparated}>
                
                <!-- Card 1: Service (or Integrated) -->
                <div class="card glass-card result-card service-card">
                    <div class="code-header">
                        <div class="title-group">
                            {#if isBeanSeparated}
                                <span class="badge service">Service</span>
                            {:else}
                                <span class="badge integrated">Integrated</span>
                            {/if}
                            <span class="filename">{trxCd}.java</span>
                        </div>
                        <button class="copy-btn" onclick={() => copyCode('service')}>
                            {copyState.service ? '✓ 완료' : '📋 복사'}
                        </button>
                    </div>
                    <div class="code-block">
                        <pre><code>{serviceCode}</code></pre>
                    </div>
                </div>

                <!-- Card 2: Bean (Only shown if separated) -->
                {#if isBeanSeparated}
                    <div class="card glass-card result-card bean-card">
                        <div class="code-header">
                            <div class="title-group">
                                <span class="badge bean">Bean</span>
                                <span class="filename">M{trxCd.slice(2)}.java</span>
                            </div>
                            <button class="copy-btn" onclick={() => copyCode('bean')}>
                                {copyState.bean ? '✓ 완료' : '📋 복사'}
                            </button>
                        </div>
                        <div class="code-block">
                            <pre><code>{beanCode}</code></pre>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

    </div>
</div>

<style>
    /* --- Layout & Background --- */
    .gen-source-block {
        display: flex;
        align-items: baseline;
        justify-content: center;
        padding: 2rem;
        position: relative;
        overflow-y: auto;
    }

    .bg-effects { position: absolute; inset: 0; overflow: hidden; z-index: -1; }
    .bg-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.3; }
    .bg-blob-pink { top: 20%; left: 10%; width: 24rem; height: 24rem; background: rgba(236, 72, 153, 0.4); }
    .bg-blob-cyan { bottom: 20%; right: 10%; width: 24rem; height: 24rem; background: rgba(6, 182, 212, 0.4); }
    .bg-blob-purple { top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30rem; height: 30rem; background: rgba(168, 85, 247, 0.3); }

    /* --- Content Wrapper Logic --- */
    .content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 100%;
        max-width: 48rem; /* Default width */
        transition: max-width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 10;
    }

    /* Width variations based on result state */
    .content-wrapper.expanded-wide { max-width: 80rem; }   /* 2 Columns */
    .content-wrapper.expanded-narrow { max-width: 48rem; } /* 1 Column */

    /* --- Glass Card --- */
    .glass-card {
        backdrop-filter: blur(24px);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    /* --- Input Section --- */
    .input-section { padding: 2rem; width: 100%; box-sizing: border-box; }
    .header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .header-dot { width: 0.75rem; height: 0.75rem; background: #ec4899; border-radius: 50%; box-shadow: 0 0 10px #ec4899; }
    .header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .description { color: rgba(255, 255, 255, 0.5); font-size: 0.9rem; margin-bottom: 1.5rem; }

    /* Form Fields */
    .form-fields { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 2rem; }
    .row-group-custom { display: grid; grid-template-columns: 2fr 5fr; gap: 1rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .field-group label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); font-weight: 500; }
    
    .input-wrapper input {
        width: 100%; padding: 0.75rem 1rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        color: white; font-size: 0.95rem;
        transition: all 0.2s; box-sizing: border-box;
    }
    .input-wrapper input:focus { outline: none; border-color: #ec4899; background: rgba(0, 0, 0, 0.4); }

    /* --- Toggle Switch --- */
    .toggle-area {
        display: flex; align-items: center; gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 1rem;
    }
    
    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    
    .slider {
        position: absolute; cursor: pointer; inset: 0;
        background-color: rgba(255,255,255,0.1); border-radius: 24px;
        transition: .4s;
    }
    .slider:before {
        position: absolute; content: "";
        height: 18px; width: 18px; left: 3px; bottom: 3px;
        background-color: white; border-radius: 50%;
        transition: .4s;
    }
    
    input:checked + .slider { background-color: #ec4899; }
    input:checked + .slider:before { transform: translateX(20px); }

    .toggle-label { display: flex; flex-direction: column; gap: 0.1rem; }
    .label-title { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.9); }
    .label-desc { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

    /* --- Buttons --- */
    .button-group { display: flex; gap: 1rem; }
    .btn { flex: 1; padding: 0.875rem; border-radius: 0.75rem; border: none; cursor: pointer; position: relative; overflow: hidden; font-weight: 600; color: white; transition: transform 0.1s; }
    .btn:active { transform: scale(0.98); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: transparent; }
    .btn-glow { position: absolute; inset: 0; background: linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4); opacity: 0.8; transition: opacity 0.3s; }
    .btn-primary:hover .btn-glow { opacity: 1; }
    .btn-content { position: relative; z-index: 1; display: flex; justify-content: center; align-items: center; gap: 0.5rem; }
    .btn-secondary { background: rgba(255, 255, 255, 0.1); flex: 0 0 auto; width: 5rem; }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
    .spinner { width: 1rem; height: 1rem; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* --- Results Area --- */
    .results-container {
        display: grid;
        grid-template-columns: 1fr 1fr; /* Default: 2 columns */
        gap: 1.5rem;
        animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* Single Column Modifier */
    .results-container.single-col {
        grid-template-columns: 1fr; /* Change to 1 column */
    }

    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .result-card { display: flex; flex-direction: column; overflow: hidden; height: 500px; }
    
    /* Card Borders */
    .service-card { border-top: 3px solid #ec4899; }
    .bean-card { border-top: 3px solid #06b6d4; }
    
    /* Code Header */
    .code-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1rem 1.25rem;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .title-group { display: flex; align-items: center; gap: 0.75rem; }
    .filename { font-family: monospace; font-size: 0.9rem; color: rgba(255, 255, 255, 0.9); }
    
    .badge { font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-weight: 700; text-transform: uppercase; }
    .badge.service { background: rgba(236, 72, 153, 0.2); color: #f9a8d4; }
    .badge.bean { background: rgba(6, 182, 212, 0.2); color: #67e8f9; }
    .badge.integrated { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }

    .copy-btn {
        background: rgba(255, 255, 255, 0.1); border: none; color: white;
        padding: 0.4rem 0.8rem; border-radius: 0.4rem; font-size: 0.75rem;
        cursor: pointer; transition: background 0.2s;
    }
    .copy-btn:hover { background: rgba(255, 255, 255, 0.2); }

    .code-block { flex: 1; overflow: auto; padding: 0; background: rgba(0, 0, 0, 0.3); }
    .code-block pre { margin: 0; padding: 1.25rem; }
    .code-block code { font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 0.85rem; line-height: 1.6; color: #e2e8f0; }

</style>