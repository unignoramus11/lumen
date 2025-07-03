/**
 * @file This file defines the API route for administrator login.
 * It handles POST requests for authentication, verifying the provided password
 * against an environment variable and issuing a JWT token upon successful login.
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Handles POST requests for administrator login.
 * Expects a JSON body with a 'password' field.
 * Verifies the password against the `ADMIN_PASSWORD` environment variable.
 * If authentication is successful, a JWT token is issued with a 1-week expiry.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A JSON response containing a JWT token on success,
 * or an error message with an appropriate HTTP status code on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin password is set and if the provided password matches
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Create a JWT token that expires in 1 week for the authenticated admin
    const token = jwt.sign({ admin: true }, adminPassword, { expiresIn: "7d" });

    // Return the token in the response
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Auth error:", error);
    // Return a generic authentication failed message on server errors
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
