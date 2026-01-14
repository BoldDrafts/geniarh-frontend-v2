const fs = require("fs")

require("dotenv").config()

const targetPath = './src/environments/environment.ts';

const envConfig = `
export const environment = {
  production: false,
  apiUrl: '${process.env['API_URL']}',
};
`;

fs.writeFileSync(targetPath, envConfig);
console.log(`✅ Environment generado en ${targetPath}`);
