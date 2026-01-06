<script>
    import { ThemeToggle, SchemeSelector } from '@goobits/themes/svelte';
</script>

<div class="controls">
    <SchemeSelector />
    <ThemeToggle />
</div>

<style>
    .controls {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }
</style>
