# Inpay

inPay: Your all-in-one financial hub. Provides global money transfers along with real-time conversations.

## User Features:

- Transfer money between friends
- Deposit from and withdraw to your preferred bank
- Pay merchants by scanning QR codes
- Real-time chats and notifications
- 30-day balance history

## Merchant Features:

- Accept payments in any currency worldwide (INR, USD, AED)
- Generate customized QR codes
- View transaction overviews by country
- Access payment summaries for the last 7 and 30 days

## Server side:

- Used Redis Queues for transactions and a dedicated web-hook for bank responses
- Cached usernames to reduce database queries and improve response times
- Addressed critical edge cases, such as prevention of negative amount transfers
- Auto-scaling servers based on CPU Usage on Azure

## Development:

- Turborepo for managing multiple apps under same repo.
- Unit and Integration tests to ensure app works correctly.
- CI/CD Pipelines for tests, build and deploying to Azure Container Apps.
- Implemented OpenAPI documentation for API routes.
- Dockerized apps for easy contribution and setup.

## CONTRIBUTING

We have all contribution guides at <a href="./CONTRIBUTING.md">CONTRIBUTING.md</a>

## API Documentation

https://inpay.mallik.tech/docs
