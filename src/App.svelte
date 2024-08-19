<script lang="ts">
    import About from "./layout/about.svelte";

	export let name: string;
</script>

<header>
</header>




<div class="flex items-center">
	<About/>
</div>



<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>