import { Redis } from "@upstash/redis"
// class responsible for converting text into vectors using OpenAi models
// we will create a new instance of it and use it on PineconeStore
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
// abstraction over the underlying pinecone index, provides managing and searching funct.
import { PineconeStore } from "langchain/vectorstores/pinecone "
import { PineconeClient } from "@pinecone-database/pinecone"

// This class handles different aspects related to memory management of our AI "characters" (companions)
// It uses a SINGLETON PATTERN to ensure that there is only one instance of this class

//TODO: About the singleton pattern: there will be one instace for all the users!??
// that allows to control access to some resources. It makes sense for example when reasources are expensive to init

// Redis stores data in-memory, in RAM instead of on disk. That makes it very fast, but can be lost if process terminated!
// it can be use as a database, cache, streaming engine (?)
// can also persist to permanent storage

// Pinecone, is used for managing and searching vectors. It's here to support similarity searches

// Upstash is a Serverless Data Platform with Redis and Kafka support

export class MemoryManager {
    // "static" refers to something that belongs to the class itself, instead of the instances
    // static is used as part of the Singleton pattern, that ensures that a class has only one instance and provides a global point of access
    static instance // hold a reference to the single instance of MemoryManager
    #history // Private property to hold redis client (history)
    #vectorDBClient // Private property to hold Pinecone client

    // class constructor.
    constructor() {
        this.#history = Redis.fromEnv(); // automatically loads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from the environment variables.
        this.#vectorDBClient = new PineconeClient();
    }

    // Initialize the Pinecone client
    async init() {
        if (this.#vectorDBClient instanceof PineconeClient) { // the if adds a layer of safety but might not be necesary...
            await this.#vectorDBClient.init({
                apiKey: process.env.PINECONE_API_KEY,
                environment: process.env.PINECONE_ENVIRONMENT,
            })
        }
    }

    // Conduct a vector search using pinecone
    async vectorSearch(
        recentChatHistory,
        companionFileName
    ) {

        const pineconeClient = this.#vectorDBClient // get the pinecone client instance
        const pinecodeIndex = pineconeClient.Index( // get the database table based on the environment variable
            process.env.PINECONE_INDEX || ""
        )

        // Creates a vector store using OpenAI embeddings and the Pinecone index.
        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY }),
            { pinecodeIndex }
        )

        // Conducts a similarity search on the recent chat history, and returns the top 3 similar documents.
        const similarDocs = await vectorStore
            .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
            .catch((err) => {
                console.log("Failed to get vector search results", err)

            })
        return similarDocs
    }

    // If the instance does not exist, it creates it. If the instance exists, returns that one
    // static = is a method of the class itself, not the instances (which makes sense, as otherwise we would need an instance to...
    //... get an instace)
    static async getInstance() {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager() // calls the constructor of the class
            await MemoryManager.instance.init() // ... and initializes it
        }

        return MemoryManager.instance
    }

    generateRedisCompanionKey(companionKey) {
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`
    }

    // adds a message to the Redis history
    async writeToHistory(text, companionKey) {
        if (!companionKey || companionKey.userId === 'undefined') {
            console.log('Companion key set incorrectly')
            return ''
        }

        const key = this.generateRedisCompanionKey(companionKey)
        const result = await this.#history.zadd(key, {
            score: Date.now(),
            member: text,
        })

        return result
    }

    // get the last 30 messages from the Redis history
    async readLatestHistory(companionKey) {
        if (!companionKey || companionKey.userId === 'undefined') {
            console.log('Companion key set incorrectly')
            return ''
        }

        // search in the Redis "database" the chat history
        const key = this.generateRedisCompanionKey(companionKey)
        let result = await this.#history.zrange(key, 0, Date.now(), {
            byScore: true
        })

        result = result.slice(-30).reverse() // takes the last 30 messages and reverses them
        const recentChats = result.reverse().join("\n") //  joins the messages with a new line in between
        return recentChats
    }

    async seedChatHistory(seedContent, delimiter = "\n", companionKey) {
        if (await this.#history.exists(key)) {//means we already have a history for this companion
            console.log("User already has chat history")
        }
        const content = seedContent.split(delimiter);
        let counter = 0
        for (const line of content) {
            await this.#history.zadd(key, { score: counter, member: line })
            counter++
        }
    }

}
