<script lang="ts">
    import About from "./layout/about.svelte";
    import Awards from "./layout/awards.svelte";
    import Header from "./layout/header.svelte";
    import WorksContainer from "./layout/works-container.svelte";


	export let name: string;
</script>

<header>
	<svelte:component this={Header} />
</header>




<div class="flex items-center">
	<WorksContainer/>
	<About/>
</div>

<Awards/>


<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>