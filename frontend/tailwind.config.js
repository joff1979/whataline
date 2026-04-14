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
        cream:        '#F4EEEF',
        offwhite:     '#FAF7F8',
        teal:         '#172929',
        'teal-mid':   '#3D6B6B',
        'teal-muted': '#7A9E9E',
        'teal-dark':  '#1D3535',
        'dusty-rose': '#B8756A',
        'rose-light': '#CDA099',
        'rose-subtle':'#F0DCDA',
      },
      container: {
        center: true,
        padding: { DEFAULT: '1.5rem', lg: '3rem', xl: '5rem' },
      },
    },
  },
  plugins: [],
};
