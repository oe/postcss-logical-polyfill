// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://app.evecalm.com',
	base: '/postcss-logical-polyfill/',
	image: {
		service: {
			entrypoint: 'astro/assets/services/noop'
		}
	},
	integrations: [
		react(),
		starlight({
			title: 'PostCSS Logical Polyfill',
			description: 'Compile logical properties into one stylesheet with horizontal LTR and RTL physical-property rules for older browsers and WebViews.',
			head: [
                { tag: 'meta', attrs: { property: 'og:image', content: 'https://app.evecalm.com/postcss-logical-polyfill/social-preview.png' } },
                { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
                { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
                { tag: 'meta', attrs: { property: 'og:image:alt', content: 'PostCSS Logical Polyfill: one stylesheet for LTR and RTL layouts' } },
                { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://app.evecalm.com/postcss-logical-polyfill/social-preview.png' } },
                { tag: 'script', attrs: { type: 'application/ld+json' }, content: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareSourceCode',
                    '@id': 'https://app.evecalm.com/postcss-logical-polyfill/#project',
                    name: 'postcss-logical-polyfill',
                    description: 'Compile CSS logical properties into one stylesheet with LTR and RTL physical-property rules for older browsers and WebViews.',
                    url: 'https://app.evecalm.com/postcss-logical-polyfill/',
                    codeRepository: 'https://github.com/oe/postcss-logical-polyfill',
                    programmingLanguage: 'TypeScript',
                    runtimePlatform: 'Node.js >=20.19.0',
                    license: 'https://github.com/oe/postcss-logical-polyfill/blob/main/LICENSE'
                }) }
            ],
			logo: {
				src: './src/assets/logo.svg',
				replacesTitle: true,
			},
			editLink: {
				baseUrl: 'https://github.com/oe/postcss-logical-polyfill/edit/main/docs',
			},
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/oe/postcss-logical-polyfill' 
				},
				{
					icon: 'npm',
					label: 'npm',
					href: 'https://www.npmjs.com/package/postcss-logical-polyfill'
				}
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Configuration', slug: 'guides/configuration' },
						{ label: 'Integration Guide', slug: 'guides/integration' },
						{ label: 'How It Works', slug: 'guides/how-it-works' },
						{ label: 'Troubleshooting', slug: 'guides/troubleshooting' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Supported Properties', slug: 'references/supported-properties' },
						{ label: 'API Reference', slug: 'references/api' },
						{ label: 'Examples', slug: 'references/examples' },
					],
				},
				{
					label: 'Playground',
					items: [
						{ label: 'Playground', slug: 'playground' }
					]
				},
			],
		})
	]
});