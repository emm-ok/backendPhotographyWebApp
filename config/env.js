import dotenv from 'dotenv'

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` })

export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',    

    MONGO_URI: process.env.MONGO_URI,  
    
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET, 
    
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    
    CLIENT_URL: process.env.CLIENT_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    // STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
}

Object.entries(env).forEach(([key, value]) => {
    if(!value) {
        console.log(`Missing environment variable: ${key}`)
    }
})