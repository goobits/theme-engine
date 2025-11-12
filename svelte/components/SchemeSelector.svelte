<!-- packages/svelte-themes/src/svelte/components/SchemeSelector.svelte -->
<script lang="ts">
  import type { ThemeScheme } from '../../core/types';
  import { useTheme } from '../hooks/useTheme.svelte';

  const theme = useTheme();
  const currentScheme = $derived(theme.scheme);
  const availableSchemes = $derived(theme.availableSchemes);
</script>

<select value={currentScheme} onchange={(e) => theme.setScheme(e.currentTarget.value as ThemeScheme)}>
  {#each availableSchemes as scheme}
    <option value={scheme.name}>{scheme.displayName}</option>
  {/each}
</select>
