import type { ThemeConfig } from '@goobits/themes'

export const themeConfig: ThemeConfig = {
	schemes: {
		default: {
			name: 'default',
			displayName: 'Default',
			description: 'Clean, professional design',
			preview: {
				primary: '#3b82f6',
				accent: '#60a5fa',
				background: '#ffffff'
			}
		},
		midnight: {
			name: 'midnight',
			displayName: 'Midnight',
			description: 'Deep noir with electric accent',
			preview: {
				primary: '#2997ff',
				accent: '#66b7ff',
				background: '#1d1d1f'
			}
		},
		spells: {
			name: 'spells',
			displayName: 'Spells',
			description: 'Magical purple theme',
			preview: {
				primary: '#8b5cf6',
				accent: '#a78bfa',
				background: '#0f0a1e'
			}
		},
		forest: {
			name: 'forest',
			displayName: 'Forest',
			description: 'Soft greens and natural contrast',
			preview: {
				primary: '#2d8a2d',
				accent: '#48b048',
				background: '#f8faf8'
			}
		},
		rose: {
			name: 'rose',
			displayName: 'Rose',
			description: 'Warm blush palette with bold accents',
			preview: {
				primary: '#e85d75',
				accent: '#f07f93',
				background: '#fefbfb'
			}
		}
	}
}
