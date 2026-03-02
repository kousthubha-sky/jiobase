<script lang="ts">
	import { onMount } from 'svelte';

	let { compact = false }: { compact?: boolean } = $props();

	type OS = 'macos' | 'linux' | 'windows';
	type Method = 'npx' | 'curl' | 'powershell';

	let selectedOS: OS = $state('macos');
	let selectedMethod: Method = $state('npx');
	let copied = $state(false);

	const osOptions: { id: OS; label: string; icon: string }[] = [
		{ id: 'macos', label: 'macOS', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z' },
		{ id: 'linux', label: 'Linux', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z' },
		{ id: 'windows', label: 'Windows', icon: 'M3 12V6.5l8-1.5v7H3zm0 .5h8v7l-8-1.5V12.5zm9-8.5l9-2v10h-9V4zm0 10.5h9v10l-9-2v-8z' },
	];

	const methodOptions: Record<OS, { id: Method; label: string }[]> = {
		macos: [
			{ id: 'npx', label: 'npx' },
			{ id: 'curl', label: 'curl' },
		],
		linux: [
			{ id: 'npx', label: 'npx' },
			{ id: 'curl', label: 'curl' },
		],
		windows: [
			{ id: 'npx', label: 'npx' },
			{ id: 'powershell', label: 'PowerShell' },
		],
	};

	const commands: Record<Method, string> = {
		npx: 'npx create-jiobase',
		curl: 'curl -fsSL https://jiobase.com/install | sh',
		powershell: 'irm https://jiobase.com/install.ps1 | iex',
	};

	const hints: Record<Method, string> = {
		npx: 'Requires Node.js 18+',
		curl: 'Auto-installs Node.js if missing',
		powershell: 'Auto-installs Node.js if missing',
	};

	onMount(() => {
		const ua = navigator.userAgent.toLowerCase();
		if (ua.includes('win')) {
			selectedOS = 'windows';
		} else if (ua.includes('linux')) {
			selectedOS = 'linux';
		} else {
			selectedOS = 'macos';
		}
		selectedMethod = 'npx';
	});

	function selectOS(os: OS) {
		selectedOS = os;
		selectedMethod = methodOptions[os][0].id;
		copied = false;
	}

	function selectMethod(method: Method) {
		selectedMethod = method;
		copied = false;
	}

	async function copyCommand() {
		try {
			await navigator.clipboard.writeText(commands[selectedMethod]);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Fallback
		}
	}
</script>

<div class="w-full max-w-2xl mx-auto">
	<div class="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
		<!-- Tab bar -->
		<div class="flex items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-2">
			<!-- OS tabs -->
			<div class="flex items-center gap-1">
				{#each osOptions as os}
					<button
						onclick={() => selectOS(os.id)}
						class="rounded-md px-3 py-1.5 text-xs font-medium transition-all {selectedOS === os.id
							? 'bg-white/10 text-white'
							: 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'}"
					>
						{os.label}
					</button>
				{/each}
			</div>

			<!-- Method tabs -->
			<div class="flex items-center gap-1">
				{#each methodOptions[selectedOS] as method}
					<button
						onclick={() => selectMethod(method.id)}
						class="rounded-md px-3 py-1.5 text-xs font-medium transition-all {selectedMethod === method.id
							? 'bg-brand-400/10 text-brand-400'
							: 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'}"
					>
						{method.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Command -->
		<div class="flex items-center justify-between gap-4 px-5 py-4">
			<div class="overflow-x-auto">
				<code class="whitespace-nowrap font-mono text-sm leading-relaxed">
					<span class="text-gray-600 select-none">$&nbsp;</span><span class="text-brand-400">{commands[selectedMethod]}</span>
				</code>
			</div>
			<button
				onclick={copyCommand}
				class="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
				aria-label="Copy command"
			>
				{#if copied}
					<svg class="h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<polyline points="20 6 9 17 4 12" />
					</svg>
				{:else}
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
						<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
					</svg>
				{/if}
			</button>
		</div>

		{#if !compact}
			<!-- Hint -->
			<div class="border-t border-white/[0.06] px-5 py-2.5 flex items-center justify-between">
				<p class="text-xs text-gray-500">{hints[selectedMethod]}</p>
				{#if selectedMethod === 'npx'}
					<a href="#install-nodejs" class="text-xs text-gray-500 hover:text-brand-400 transition">Install Node.js</a>
				{/if}
			</div>
		{/if}
	</div>
</div>
