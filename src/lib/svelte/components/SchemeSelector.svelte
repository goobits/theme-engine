<!--
  @component SchemeSelector

  Dropdown select for choosing between color schemes.

  Renders a native `<select>` element populated with all available
  color schemes from the theme configuration. Changes are automatically
  persisted and applied across the application.

  Must be used within a ThemeProvider component.

  @example
  ```svelte
  <SchemeSelector />
  ```

  @example Custom styling
  ```svelte
  <div class="scheme-picker">
    <label for="scheme">Color scheme:</label>
    <SchemeSelector />
  </div>
  ```
-->
<script lang="ts">
    import { useTheme } from '../hooks/useTheme.svelte';

    const theme = useTheme();
    const currentScheme = $derived(theme.scheme);
    const availableSchemes = $derived(theme.availableSchemes);
</script>

<select value={currentScheme} onchange={e => theme.setScheme(e.currentTarget.value)}>
    {#each availableSchemes as scheme}
        <option value={scheme.name}>{scheme.displayName}</option>
    {/each}
</select>
