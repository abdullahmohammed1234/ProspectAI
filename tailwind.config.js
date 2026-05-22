module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F14',
        surface: '#111827',
        accent: {
          blue: '#4F8CFF',
          green: '#10B981'
        }
      },
      fontFamily: {
        body: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}
