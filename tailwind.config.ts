import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Terminal Typography Scale
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],      // 10px
        "xs": ["0.6875rem", { lineHeight: "1rem" }],      // 11px
        "sm": ["0.75rem", { lineHeight: "1.25rem" }],     // 12px
        "base": ["0.8125rem", { lineHeight: "1.25rem" }], // 13px
        "lg": ["0.875rem", { lineHeight: "1.25rem" }],    // 14px
        "xl": ["1rem", { lineHeight: "1.5rem" }],         // 16px
        "2xl": ["1.125rem", { lineHeight: "1.75rem" }],   // 18px
        "3xl": ["1.25rem", { lineHeight: "1.75rem" }],    // 20px
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "SFMono-Regular", "monospace"],
        ui: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        // Base shadcn colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          bright: "hsl(var(--accent-bright))",
          dim: "hsl(var(--accent-dim))",
          ghost: "hsl(var(--accent-ghost))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Terminal Background Layers
        terminal: {
          void: "hsl(var(--bg-void))",
          base: "hsl(var(--bg-base))",
          raised: "hsl(var(--bg-raised))",
          elevated: "hsl(var(--bg-elevated))",
          hover: "hsl(var(--bg-hover))",
        },
        // Terminal Border Colors
        "border-subtle": "hsl(var(--border-subtle))",
        "border-default": "hsl(var(--border-default))",
        "border-strong": "hsl(var(--border-strong))",
        // Pipeline Stage Colors
        stage: {
          new: "hsl(var(--stage-new))",
          screening: "hsl(var(--stage-screening))",
          qualified: "hsl(var(--stage-qualified))",
          interview: "hsl(var(--stage-interview))",
          submitted: "hsl(var(--stage-submitted))",
          offer: "hsl(var(--stage-offer))",
          rejected: "hsl(var(--stage-rejected))",
        },
        // Score Gradient Colors
        score: {
          10: "hsl(var(--score-10))",
          8: "hsl(var(--score-8))",
          6: "hsl(var(--score-6))",
          4: "hsl(var(--score-4))",
          2: "hsl(var(--score-2))",
        },
        // Text Colors
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          accent: "hsl(var(--text-accent))",
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      height: {
        "command-bar": "44px",
        "metrics-ribbon": "36px",
        "shortcut-bar": "32px",
        "table-row": "44px",
        "sidebar": "48px",
      },
      width: {
        "sidebar-collapsed": "48px",
        "sidebar-expanded": "240px",
        "preview-panel": "400px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        "out-fast": "cubic-bezier(0.33, 1, 0.68, 1)",
        "out-smooth": "cubic-bezier(0.22, 1, 0.36, 1)",
        "terminal": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      transitionDuration: {
        "50": "50ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "score-pulse": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(100%)", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "slide-up-fade": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "counter-tick": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
          "100%": { transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--accent) / 0)" },
          "50%": { boxShadow: "0 0 12px 4px hsl(var(--accent) / 0.3)" },
        },
        "row-highlight": {
          "0%": { backgroundColor: "hsl(var(--accent) / 0.1)" },
          "100%": { backgroundColor: "transparent" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "score-pulse": "score-pulse 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-out-right": "slide-out-right 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.15s ease-out",
        "fade-out": "fade-out 0.1s ease-out",
        "scale-in": "scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up-fade": "slide-up-fade 0.15s ease-out",
        "counter-tick": "counter-tick 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "row-highlight": "row-highlight 0.8s ease-out",
        "shimmer": "shimmer 2s infinite linear",
        "blink": "blink 1s step-end infinite",
      },
      boxShadow: {
        "terminal-sm": "0 1px 2px 0 hsl(0 0% 0% / 0.2)",
        "terminal": "0 2px 4px 0 hsl(0 0% 0% / 0.3), 0 1px 2px -1px hsl(0 0% 0% / 0.2)",
        "terminal-md": "0 4px 6px -1px hsl(0 0% 0% / 0.4), 0 2px 4px -2px hsl(0 0% 0% / 0.2)",
        "terminal-lg": "0 10px 15px -3px hsl(0 0% 0% / 0.4), 0 4px 6px -4px hsl(0 0% 0% / 0.2)",
        "glow-accent": "0 0 8px 2px hsl(var(--accent) / 0.3)",
        "glow-accent-lg": "0 0 16px 4px hsl(var(--accent) / 0.4)",
      },
      backgroundImage: {
        "terminal-gradient": "linear-gradient(180deg, hsl(var(--bg-void)) 0%, hsl(var(--bg-base)) 100%)",
        "accent-gradient": "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent-bright)) 100%)",
        "score-gradient": "linear-gradient(90deg, hsl(var(--score-2)) 0%, hsl(var(--score-4)) 25%, hsl(var(--score-6)) 50%, hsl(var(--score-8)) 75%, hsl(var(--score-10)) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
