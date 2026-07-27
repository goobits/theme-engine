/**
 * Blocking theme initialization for flash-free server-rendered pages.
 *
 * The generated script embeds only public theme configuration, validates every
 * persisted value, and mutates only classes owned by the theme engine.
 */

import {
	DEFAULT_THEME_CONFIG,
	getDefaultThemeMode,
	getDefaultThemeScheme,
	getThemePersistenceConfig,
	type ThemeConfig
} from '../core/config.js'

interface BlockingRuntimeConfig {
	defaultMode: 'light' | 'dark' | 'system'
	defaultScheme: string
	schemes: string[]
	fixedModes: Record<string, 'light' | 'dark'>
	aliases: Record<string, string>
	storageKey: string
	themeCookie: string
	schemeCookie: string
	legacySchemeStorageKey?: string
}

function createRuntimeConfig(config: ThemeConfig): BlockingRuntimeConfig {
	const persistence = getThemePersistenceConfig(config)
	const fixedModes = Object.fromEntries(
		Object.entries(config.schemes)
			.filter((entry): entry is [ string, typeof entry[1] & { fixedMode: 'light' | 'dark' } ] =>
				Boolean(entry[1].fixedMode)
			)
			.map(([ name, scheme ]) => [ name, scheme.fixedMode ])
	)

	return {
		defaultMode: getDefaultThemeMode(config),
		defaultScheme: getDefaultThemeScheme(config),
		schemes: Object.keys(config.schemes),
		fixedModes,
		aliases: config.schemeAliases ?? {},
		storageKey: persistence.storageKey,
		themeCookie: persistence.themeCookie,
		schemeCookie: persistence.schemeCookie,
		...(persistence.legacySchemeStorageKey
			? { legacySchemeStorageKey: persistence.legacySchemeStorageKey }
			: {})
	}
}

function serializeInline(value: unknown): string {
	return JSON.stringify(value)
		.replaceAll('<', '\\u003c')
		.replaceAll('>', '\\u003e')
		.replaceAll('&', '\\u0026')
		.replaceAll('\u2028', '\\u2028')
		.replaceAll('\u2029', '\\u2029')
}

/**
 * Generates the synchronous browser script for a specific theme configuration.
 */
export function createThemeBlockingScript(
	config: ThemeConfig = DEFAULT_THEME_CONFIG
): string {
	const runtimeConfig = serializeInline(createRuntimeConfig(config))
	return `(function(c){var d=document.documentElement,p={},m=false;function r(n){var a=document.cookie?document.cookie.split(';'):[];for(var i=a.length-1;i>=0;i--){var v=a[i].trim(),x=v.indexOf('=');if(x>0&&v.slice(0,x)===n){try{return decodeURIComponent(v.slice(x+1))}catch(e){return v.slice(x+1)}}}}function w(n,v){document.cookie=n+'='+encodeURIComponent(v)+'; path=/; max-age=31536000; SameSite=lax'+(location.protocol==='https:'?'; Secure':'')}try{var q=localStorage.getItem(c.storageKey);if(q)p=JSON.parse(q)||{}}catch(e){}var t=p.theme||r(c.themeCookie)||c.defaultMode,s=p.themeScheme||r(c.schemeCookie);if(!s&&c.legacySchemeStorageKey){try{s=localStorage.getItem(c.legacySchemeStorageKey);m=!!s}catch(e){}}var o=s;s=c.aliases[s]||s;if(c.schemes.indexOf(s)<0)s=c.defaultScheme;if(['light','dark','system'].indexOf(t)<0)t=c.defaultMode;t=c.fixedModes[s]||t;var h=typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: dark)').matches,z=t==='system'?(h?'dark':'light'):t;if(m||o!==s){var j=JSON.stringify({theme:t,themeScheme:s}),k=false;try{localStorage.setItem(c.storageKey,j);k=true}catch(e){}if(k&&c.legacySchemeStorageKey){try{localStorage.removeItem(c.legacySchemeStorageKey)}catch(e){}}try{w(c.themeCookie,t);w(c.schemeCookie,s)}catch(e){}}var a=Array.from(d.classList),u=['theme-light','theme-dark','theme-system','theme-system-light','theme-system-dark'];for(var i=0;i<a.length;i++){if(u.indexOf(a[i])>=0||a[i].indexOf('scheme-')===0)d.classList.remove(a[i])}d.classList.add('theme-'+t,'scheme-'+s);if(t==='system')d.classList.add('theme-system-'+z);d.setAttribute('data-theme',z)})(${ runtimeConfig });`
}

/** Default blocking script for the built-in default scheme. */
export const themeBlockingScript = createThemeBlockingScript()

/** Marker used to prevent duplicate script injection. */
export const themeBlockingScriptMarker = '<!-- @goobits/themes-blocking -->'

/** Creates a ready-to-inject blocking script tag. */
export function createThemeBlockingScriptTag(
	{
		config = DEFAULT_THEME_CONFIG,
		nonce,
		marker = themeBlockingScriptMarker
	}: {
		config?: ThemeConfig
		nonce?: string
		marker?: string
	} = {}
): string {
	const markerPrefix = marker ? `${ marker }` : ''
	const nonceAttribute = nonce ? ` nonce="${ nonce }"` : ''
	return `${ markerPrefix }<script${ nonceAttribute }>${ createThemeBlockingScript(config) }</script>`
}

/** Default ready-to-inject script tag. */
export const themeBlockingScriptTag = createThemeBlockingScriptTag()

/** Readable alias retained as the non-minified source is generated from one owner. */
export const themeBlockingScriptReadable = themeBlockingScript
