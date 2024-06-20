# yam

## About

yam stands for **your art matters**. The idea for creating yam came to me after talking to local artists and vendors who shared the struggles they face with keeping track of their products, inventory, sales, consignment prices for different businesses they work with, and more. After going through multiple iterations, yam was finally created to be a one-stop solution for those who need help managing and tracking various aspects of their business.

## Try yam out!

- You can try yam here: https://yam-p2qp.onrender.com/
- Note: yam is using the free tier of Render and Supabase, so it may take a few seconds to load.

## Backend Technologies Used

- **Programming Languages:** JavaScript
- **Backend Framework:** Node.js, Express.js
- **Database:** PostgreSQL
- **Version Control:** Git
- **Testing:** Jest
- **Security:** Bcrypt

## Features

- Product and Inventory Management
- Business Partner Management
- Direct and Business Sales Tracking
- RESTful APIs

## Local Development Setup

1. Clone the backend repository.
2. Navigate to the directory.
3. Install Dependencies:
   - ```bash
     npm install
     ```
4. Create a `.env` file with your secret key:
   - ```env
     SECRET_KEY=your_secret_key
     ```
5. Create a `fallbackVariables.js` file in your root directory with `SECRET_KEY_FALLBACK`:
   - ```javascript
     const SECRET_KEY_FALLBACK = your_secret_key_fallback;
     module.exports = { SECRET_KEY_FALLBACK };
     ```
6. Ensure `config.js` is set up with your database configurations.
7. Start the server:
   - ```bash
     nodemon server.js
     ```

## Contact

For any questions, support, or recommendations, please reach out to simmonds.nicolas@gmail.com

---

_Thank you for your support!_
