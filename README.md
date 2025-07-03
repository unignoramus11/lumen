# Lumen

## A Personal Newspaper-Style Photo Journal

Lumen is a template web application designed for individuals who wish to maintain a unique, newspaper-style photo journal. It integrates quirky elements such as poems, jokes, random facts, and activities, along with a daily comic, all fetched from external APIs + scraping. With a strong emphasis on design, this platform is highly customizable and can be reused by anyone by simply updating the environment variables.

This project was inspired by my best friend, and you can explore my own photo journal at [lumen-sigma.vercel.app](https://lumen-sigma.vercel.app).

### Mission

The main mission of Lumen is to provide a visually appealing and engaging platform for personal journaling, offering a blend of visual content (photos) with diverse, entertaining textual elements.

### Intended Audience

Lumen is intended for anyone who desires a fun, aesthetically pleasing, and easy-to-use platform for personal photo journaling.

## Features

- **Daily Photo Journal:** Document your days with personal photos.
- **Curated Content:** Enjoy daily poems, jokes, random facts (cat, dog, trivia), and activities.
- **Comic Integration:** A daily comic strip for an added touch of humor.
- **Newspaper-Style Design:** A unique and elegant user interface.
- **Customizable:** Easily adaptable for personal use through environment variables.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version recommended)
- npm or Yarn
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/unignoramus11/lumen.git
   cd lumen
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root of your project and populate it with the necessary environment variables. You can use the `.env.example` file as a reference.

   ```bash
   ADMIN_PASSWORD=your_admin_password
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

   - `ADMIN_PASSWORD`: A password required for publishing content. Choose a strong, secure password.
   - `NEXTAUTH_URL` (optional): The base URL of your Next.js application. For local development, this is typically `http://localhost:3000`. For production, set this to your deployed domain (e.g., `https://your-domain.com`).
   - `NEXTAUTH_SECRET` (optional): A secret used by NextAuth.js for signing and encrypting tokens. Generate a strong, random string for this (e.g., using `openssl rand -base64 32`).
   - `MONGODB_URI`: Your MongoDB connection string. This is essential for storing journal entries and other data.
   - `NEXT_PUBLIC_BASE_URL` (optional): The public base URL for the application, often the same as `NEXTAUTH_URL`.

### Running the Development Server

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

### Running in Production

To run the built application in production mode:

```bash
npm run start
# or
yarn start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or feedback, please refer to the GitHub repository: [https://github.com/unignoramus11/lumen](https://github.com/unignoramus11/lumen)
