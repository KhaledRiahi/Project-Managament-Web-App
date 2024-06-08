/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1200px",
      xl: "1440px",
    },
    extend: {
      colors: {
        myBlue: "#081F8F",
        myPink: "#787878",
      },
      backgroundImage: (theme) => ({
        
        pattern:
          "url('https://firebasestorage.googleapis.com/v0/b/projets-7a893.appspot.com/o/abstract-paper-background-concept.jpg?alt=media&token=6c8a96d9-421c-4743-a1b9-cef0ec53de89')",
      }),
    },
  },
  plugins: [],
};
