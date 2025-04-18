module.exports = {
  content: [
    "./views/**/*.{html,js,css} "
  ],
  theme: {
    extend: {
        colors: {
            stone: colors.warmGray,
            sky: colors.lightBlue,
            neutral: colors.trueGray,
            gray: colors.coolGray,
            slate: colors.blueGray
        }
    }
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ],
};

const colors = require('tailwindcss/colors')

module.exports = {
    theme: {
        extend: {
            colors: {
                stone: colors.warmGray,
                sky: colors.lightBlue,
                neutral: colors.trueGray,
                gray: colors.coolGray,
                slate: colors.blueGray,
            }
        }
    }
}