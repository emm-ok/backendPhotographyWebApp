import { env } from './env.js'

export const jwtConfig = {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,

    accessExpiry: '15m',
    refreshExpiry: '7d',

    issuer: 'photography-platform'
}