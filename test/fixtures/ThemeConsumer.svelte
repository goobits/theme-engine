<script lang="ts">
	import { useTheme } from '../../src/lib/svelte/hooks/useTheme.svelte.js'

	const theme = useTheme()
</script>

<output data-testid="theme-state">{theme.theme}:{theme.scheme}</output>
