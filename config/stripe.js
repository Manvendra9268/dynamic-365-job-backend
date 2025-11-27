const dotenv = require('dotenv');
const Stripe = require('stripe');
const logger = require('../utils/logger');

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY is not configured');
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2025-11-17.clover',
  appInfo: {
    name: 'dynamic-365-job-backend',
  },
});

module.exports = stripe;

