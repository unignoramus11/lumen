/**
 * @file This file defines the Mongoose schema and model for `DailyContent`.
 * It outlines the structure for storing all daily content, including headlines, photos,
 * poems, jokes, activities, and various facts, in the MongoDB database.
 */

import mongoose, { Schema, Document } from "mongoose";
import type { DailyData } from "../types";

/**
 * Interface representing a DailyContent document in MongoDB.
 * Extends Mongoose's `Document` and the `DailyData` type from `../types`,
 * ensuring type safety and Mongoose-specific properties.
 */
export interface IDailyContent extends Document, DailyData {}

/**
 * Mongoose Schema for Joke content.
 * Defines the structure for storing single-part or two-part jokes.
 * `_id: false` prevents Mongoose from creating a default `_id` for subdocuments.
 */
const JokeSchema = new Schema(
  {
    type: { type: String, required: true, enum: ["single", "twopart"] },
    joke: { type: String },
    setup: { type: String },
    delivery: { type: String },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Photo content.
 * Defines the structure for storing image data as a Buffer and its associated label.
 */
const PhotoSchema = new Schema(
  {
    imageBlob: { type: Buffer, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Poem content.
 * Defines the structure for storing poem details like title, author, and lines.
 */
const PoemSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    lines: [{ type: String, required: true }],
  },
  { _id: false }
);

/**
 * Mongoose Schema for Activity content.
 * Defines the structure for storing a suggested activity.
 */
const ActivitySchema = new Schema(
  {
    activity: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Cat Fact content.
 * Defines the structure for storing a cat fact.
 */
const CatFactSchema = new Schema(
  {
    fact: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Dog Fact content.
 * Defines the structure for storing a dog fact.
 */
const DogFactSchema = new Schema(
  {
    fact: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Trivia Fact content.
 * Defines the structure for storing a trivia fact.
 */
const TriviaFactSchema = new Schema(
  {
    fact: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Mongoose Schema for Comic content.
 * Defines the structure for storing comic image URL and alt text.
 */
const ComicSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    altText: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Main Mongoose Schema for DailyContent.
 * This schema defines the overall structure for each daily entry in the newspaper-style journal.
 * It includes a unique date, headline, photo details, and various fetched content types.
 * `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
 */
const DailyContentSchema = new Schema(
  {
    date: { type: String, required: true, unique: true },
    headline: { type: String, required: true },
    photo: { type: PhotoSchema, required: true },
    poem: { type: PoemSchema, required: true },
    joke: { type: JokeSchema, required: true },
    activity: { type: ActivitySchema, required: true },
    catFact: { type: CatFactSchema, required: true },
    dogFact: { type: DogFactSchema, required: true },
    triviaFact: { type: TriviaFactSchema, required: true },
    comic: { type: ComicSchema, required: true },
  },
  {
    timestamps: true,
  }
);

/**
 * Mongoose model for DailyContent.
 * Exports the existing model if it has already been defined, otherwise creates a new one.
 * This prevents re-compilation issues during hot-reloading in development environments.
 */
export default mongoose.models.DailyContent ||
  mongoose.model<IDailyContent>("DailyContent", DailyContentSchema);
