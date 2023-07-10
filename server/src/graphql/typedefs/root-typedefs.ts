import { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sdlTypeDefs: string = '';

const dotGraphqlFiles = readdirSync(path.join(__dirname));

dotGraphqlFiles.forEach(file => {
  if (!file.endsWith('.graphql')) {
    return;
  }
  sdlTypeDefs += readFileSync(path.join(__dirname, file), {
    encoding: 'utf-8'
  })
})

const Queries: string = `
  "Just some random data to get started and avoid errors for now"
  type Query {
    "Get all users"
    getUsers: [User!]!
  }
`;

// const Mutations: string = ``;

export const typeDefs = `#graphql
  ${Queries}

  ${sdlTypeDefs}
`;
