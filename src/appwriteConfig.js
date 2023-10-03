import { Client, Databases, Account } from 'appwrite';
// const dotenv = require('dotenv').config({ path: './.env' })

// const sdk = require('node-appwrite')

export const PROJECT_ID = '6516dac84b2d21fb307a'
export const DATABASE_ID = '6516db9f04b569c55a81'
export const COLLECTION_ID_MESSAGES = '6516dbac3f49cc67c7af'
// export const USER_ID = null


const client = new Client();

export const account = new Account(client)

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6516dac84b2d21fb307a');

export const databases = new Databases(client);

export default client;