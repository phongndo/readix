<script lang="ts" module>
	export interface FileInputProps {
		accept?: string;
		multiple?: boolean;
		onSelect: (files: FileList) => void;
		class?: string;
	}
</script>

<script lang="ts">
	let { accept, multiple = false, onSelect, class: className }: FileInputProps = $props();

	let inputRef: HTMLInputElement;

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			onSelect(target.files);
		}
		// Reset input so same file can be selected again
		target.value = '';
	}

	export function click() {
		inputRef?.click();
	}
</script>

<input
	bind:this={inputRef}
	type="file"
	{accept}
	{multiple}
	class="hidden {className}"
	onchange={handleChange}
/>
