/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(3rem, 8vw, 7rem)',       { lineHeight: '1.0',  letterSpacing: '-0.02em' }],
        '4xl': ['clamp(2rem, 4vw, 3.5rem)',    { lineHeight: '1.1',  letterSpacing: '-0.01em' }],
        '3xl': ['clamp(1.5rem, 3vw, 2.5rem)',  { lineHeight: '1.15' }],
        '2xl': ['clamp(1.25rem, 2vw, 1.75rem)',{ lineHeight: '1.25' }],
        xl:    ['1.25rem',  { lineHeight: '1.4'  }],
        lg:    ['1.125rem', { lineHeight: '1.5'  }],
        base:  ['1rem',     { lineHeight: '1.65' }],
        sm:    ['0.875rem', { lineHeight: '1.6'  }],
        xs:    ['0.75rem',  { lineHeight: '1.5', letterSpacing: '0.06em' }],
      },
      colors: {
        parchment:    '#F2EDE4',
        offwhite:     '#FAF7F2',
        ink:          '#1C1712',
        bark:         '#3D2E22',
        stone:        '#7A6E63',
        terracotta:   '#C1603A',
        'dusty-rose': '#D4957A',
        blush:        '#EDD5C5',
        charcoal:     '#1A1410',
        'warm-dark':  '#251E18',
      },
      container: {
        center: true,
        padding: { DEFAULT: '1.5rem', lg: '3rem', xl: '5rem' },
      },
    },
  },
  plugins: [],
};
