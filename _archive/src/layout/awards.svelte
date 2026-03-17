<script lang="ts">
    import Award from "./award.svelte";

let awards = [
    { src:'/images/SEMI_FINALIST - Kingston International Film Festival KIFF - 2022.png', 
    alt:'SEMI FINALIST - Kingston International Film Festival KIFF - 2022'},
    { src:'/images/SEMI_FINALIST - Kingston International Film Festival KIFF - 2022.png', 
    alt:'SEMI FINALIST - Kingston International Film Festival KIFF - 2022'},
    { src:'/images/SEMI_FINALIST - Kingston International Film Festival KIFF - 2022.png', 
    alt:'SEMI FINALIST - Kingston International Film Festival KIFF - 2022'},

]
</script>


<ul class="content flex items-center">
    {#each awards as detail, i}
    <Award {...detail}></Award>
    {/each}
</ul>



