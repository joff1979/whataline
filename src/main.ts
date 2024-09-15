import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'What a line'
	}
});

export default app;