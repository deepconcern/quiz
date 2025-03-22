
import type { CodegenConfig } from '@graphql-codegen/cli';
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");

const config: CodegenConfig = {
  overwrite: true,
  schema: `${env.VITE_API_URI}/graphql`,
  documents: ["src/**/*.ts", "src/**/*.tsx"],
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
