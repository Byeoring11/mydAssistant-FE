<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getPatchNotes,
		createPatchNote,
		deletePatchNote,
		type PatchNoteResponse
	} from '$lib/api/patchnoteApi';
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';

	// State
	let patchNotes = $state<PatchNoteResponse[]>([]);
	let loading = $state(true);

	// Create form state
	let showCreateForm = $state(false);
	let createForm = $state({
		title: '',
		content: '',
		patch_date: new Date().toISOString().split('T')[0] // Today YYYY-MM-DD
	});

	// Load patch notes
	async function loadPatchNotes() {
		loading = true;
		try {
			const response = await getPatchNotes({ limit: 1000 });
			patchNotes = response.items;
		} catch (error) {
			console.error('[PatchNote] Failed to load patch notes:', error);
			showNotification('error', '패치 노트 조회에 실패했습니다');
		} finally {
			loading = false;
		}
	}

	// Create patch note
	async function handleCreate() {
		if (!createForm.title.trim() || !createForm.content.trim()) {
			showNotification('warning', '제목과 내용을 입력해주세요');
			return;
		}

		try {
			await createPatchNote({
				title: createForm.title.trim(),
				content: createForm.content.trim(),
				patch_date: createForm.patch_date
			});

			// Reset form
			createForm.title = '';
			createForm.content = '';
			createForm.patch_date = new Date().toISOString().split('T')[0];
			showCreateForm = false;

			// Reload list
			await loadPatchNotes();
			showNotification('success', '패치 노트가 생성되었습니다');
		} catch (error) {
			console.error('[PatchNote] Failed to create patch note:', error);
			showNotification('error', '패치 노트 생성에 실패했습니다');
		}
	}

	// Delete patch note
	async function handleDelete(id: number) {
		if (!confirm('정말 삭제하시겠습니까?')) {
			return;
		}

		try {
			await deletePatchNote(id);
			await loadPatchNotes();
			showNotification('success', '패치 노트가 삭제되었습니다');
		} catch (error) {
			console.error('[PatchNote] Failed to delete patch note:', error);
			showNotification('error', '패치 노트 삭제에 실패했습니다');
		}
	}

	// Format date for display
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Format datetime for display
	function formatDateTime(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	onMount(() => {
		loadPatchNotes();
	});
</script>

<svelte:head>
	<title>Patch Note - Mydata Assistant</title>
</svelte:head>

<div class="patchnote-container">
	<!-- Header -->
	<div class="header">
		<div class="header-content">
			<h1 class="title">📝 Patch Notes</h1>
			<button class="create-btn" onclick={() => (showCreateForm = !showCreateForm)}>
				{showCreateForm ? '취소' : '+ 새 패치 노트'}
			</button>
		</div>
	</div>

	<!-- Create Form -->
	{#if showCreateForm}
		<div class="create-form">
			<div class="form-group">
				<label for="title">제목</label>
				<input
					type="text"
					id="title"
					bind:value={createForm.title}
					placeholder="패치 제목을 입력하세요"
					maxlength="200"
				/>
			</div>

			<div class="form-group">
				<label for="patch_date">패치 날짜</label>
				<input type="date" id="patch_date" bind:value={createForm.patch_date} />
			</div>

			<div class="form-group">
				<label for="content">내용</label>
				<textarea
					id="content"
					bind:value={createForm.content}
					placeholder="패치 내용을 입력하세요"
					rows="6"
				></textarea>
			</div>

			<div class="form-actions">
				<button class="btn-primary" onclick={handleCreate}>생성</button>
				<button class="btn-secondary" onclick={() => (showCreateForm = false)}>취소</button>
			</div>
		</div>
	{/if}

	<!-- Timeline -->
	<div class="timeline">
		{#if loading}
			<div class="loading">패치 노트를 불러오는 중...</div>
		{:else if patchNotes.length === 0}
			<div class="empty">패치 노트가 없습니다</div>
		{:else}
			{#each patchNotes as note, index (note.id)}
				<div class="timeline-item">
					<!-- Date Label -->
					<div class="date-label">
						<span class="patch-date">{formatDate(note.patch_date)}</span>
					</div>

					<!-- Timeline Line & Dot -->
					<div class="timeline-line-wrapper">
						{#if index > 0}
							<div class="timeline-line-top"></div>
						{/if}
						<div class="timeline-dot"></div>
						{#if index < patchNotes.length - 1}
							<div class="timeline-line-bottom"></div>
						{/if}
					</div>

					<!-- Content Card -->
					<div class="timeline-content">
						<div class="card">
							<div class="card-header">
								<h3 class="card-title">{note.title}</h3>
								<button class="delete-btn" onclick={() => handleDelete(note.id)} title="삭제">
									×
								</button>
							</div>

							<div class="card-body">
								<pre class="content">{note.content}</pre>
							</div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.patchnote-container {
		max-width: 1200px;
		margin: 0;
		padding: 2rem 1rem 2rem 2rem;
		min-height: 100vh;
	}

	/* Header */
	.header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		background: linear-gradient(135deg, rgba(96, 165, 250, 1), rgba(139, 92, 246, 1));
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
	}

	.create-btn {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(139, 92, 246, 0.2));
		border: 1px solid rgba(96, 165, 250, 0.3);
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		color: rgba(96, 165, 250, 1);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.create-btn:hover {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(139, 92, 246, 0.3));
		border-color: rgba(96, 165, 250, 0.5);
		transform: translateY(-2px);
	}

	/* Create Form */
	.create-form {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 500;
	}

	.form-group input[type='text'],
	.form-group input[type='date'],
	.form-group textarea {
		width: 100%;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		padding: 0.75rem;
		color: white;
		font-family: inherit;
		font-size: 0.95rem;
		resize: vertical;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: rgba(96, 165, 250, 0.5);
		background: rgba(255, 255, 255, 0.15);
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.btn-primary {
		background: linear-gradient(135deg, rgba(96, 165, 250, 1), rgba(139, 92, 246, 1));
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.8);
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	/* Timeline */
	.timeline {
		position: relative;
	}

	.loading,
	.empty {
		text-align: center;
		padding: 3rem 1rem;
		color: rgba(255, 255, 255, 0.6);
		font-size: 1.1rem;
	}

	.timeline-item {
		display: grid;
		grid-template-columns: 120px 24px 1fr;
		gap: 1.5rem;
		position: relative;
		margin-bottom: 2rem;
		align-items: start;
	}

	.timeline-item:last-child {
		margin-bottom: 0;
	}

	/* Date Label */
	.date-label {
		text-align: right;
		padding-top: 0.25rem;
	}

	.patch-date {
		display: inline-block;
		font-size: 0.85rem;
		color: rgba(96, 165, 250, 1);
		font-weight: 600;
	}

	/* Timeline Line & Dot */
	.timeline-line-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 24px;
		flex-shrink: 0;
	}

	.timeline-dot {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(96, 165, 250, 1), rgba(139, 92, 246, 1));
		border: 4px solid rgba(30, 30, 40, 1);
		z-index: 2;
		flex-shrink: 0;
	}

	.timeline-line-top,
	.timeline-line-bottom {
		position: absolute;
		width: 2px;
		background: rgba(96, 165, 250, 0.4);
		left: 50%;
		transform: translateX(-50%);
	}

	.timeline-line-top {
		top: -1.7rem;
		height: calc(50% + 1.7rem);
	}

	.timeline-line-bottom {
		top: 50%;
		height: calc(100% + 4rem);
	}

	/* Content Card */
	.timeline-content {
		flex: 1;
		min-width: 0;
	}

	.card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		transition: all 0.3s ease;
		position: relative;
	}

	.card:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.2);
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.3),
			0 0 40px rgba(96, 165, 250, 0.1);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
		gap: 1rem;
	}

	.card-title {
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0;
		color: white;
		flex: 1;
		min-width: 0;
	}

	.delete-btn {
		background: transparent;
		border: none;
		color: rgba(239, 68, 68, 0.6);
		font-size: 1.5rem;
		line-height: 1;
		padding: 0;
		width: 24px;
		height: 24px;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn:hover {
		color: rgba(239, 68, 68, 1);
		transform: scale(1.2);
	}

	.card-body {
		margin-bottom: 0;
		padding-left: 1rem;
		border-left: 2px solid rgba(96, 165, 250, 0.2);
		margin-left: 0.5rem;
	}

	.content {
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
		white-space: pre-wrap;
		word-wrap: break-word;
		margin: 0;
		font-family: inherit;
		font-size: 0.9rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.patchnote-container {
			padding: 1rem 0.5rem;
		}

		.title {
			font-size: 1.5rem;
		}

		.timeline-item {
			grid-template-columns: 80px 16px 1fr;
			gap: 0.75rem;
		}

		.date-label {
			font-size: 0.75rem;
		}

		.patch-date {
			font-size: 0.75rem;
		}

		.timeline-line-wrapper {
			width: 16px;
		}

		.timeline-dot {
			width: 16px;
			height: 16px;
			border-width: 3px;
		}

		.card {
			padding: 0.75rem 1rem;
		}

		.card::before {
			left: -0.75rem;
			width: 0.5rem;
			top: 0.4rem;
		}

		.card-title {
			font-size: 1rem;
		}

		.card-body {
			padding-left: 0.75rem;
			margin-left: 0.25rem;
		}

		.delete-btn {
			width: 20px;
			height: 20px;
			font-size: 1.25rem;
		}
	}
</style>
