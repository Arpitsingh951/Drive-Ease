import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Always load the .env file located inside the server folder
dotenv.config({ path: path.resolve(__dirname, '../.env') })
// Fallback to default process.cwd() .env if any
dotenv.config()
