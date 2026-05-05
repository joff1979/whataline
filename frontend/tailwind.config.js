/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Amaranth', 'system-ui', 'sans-serif'],
        body: ['Raleway', 'system-ui', 'sans-serif'],
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
        teal:         '#008080',
        'teal-dark':  '#004040',
        'teal-deeper':'#005555',
        turquoise:    '#A6C6C9',
        'dusty-rose': '#C9A9A6',
        'rose-light': '#D9C0BE',
        'rose-subtle':'#EEE5E4',
      },
      container: {
        center: true,
        padding: { DEFAULT: '1.5rem', lg: '3rem', xl: '5rem' },
      },
    },
  },
  plugins: [],
};
