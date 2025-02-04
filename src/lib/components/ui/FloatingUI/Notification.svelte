<!-- src/components/Notification.svelte -->
<script>
	import { notification } from './notificationStore';
	import { fade } from 'svelte/transition';
</script>

{#if $notification.visible}
	<div transition:fade={{ duration: 300 }} class="notification--{$notification.type}">
		{@html $notification.message}
	</div>
{/if}

<style>
  .notification--info {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		padding: 10px 20px;
		background-color: #27832f;
		color: white;
		border-radius: 5px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

  .notification--warning {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		padding: 10px 20px;
		background-color: #da9939;
		color: white;
		border-radius: 5px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.notification--error {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		padding: 10px 20px;
		background-color: #f14a3f;
		color: white;
		border-radius: 5px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}
</style>
