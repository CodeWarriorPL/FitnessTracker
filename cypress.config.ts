import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {

    chromeWebSecurity: false,          // Pozwala na testy HTTPS bez zatwierdzonych certyfikatów
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
