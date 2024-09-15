<script lang="ts">
    import Header from "./components/Header.svelte";
    import Profile from "./components/Profile.svelte";
    import Footer from "./components/Footer.svelte";

</script>

<div class="container mx-auto px-4">
    <div class="hidden sm:block">
        <Header />
    </div>
    
    <main>
        <Profile  />
    </main>

    <Footer />
</div>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	body {
		@apply bg-white font-sans;
	}
</style>