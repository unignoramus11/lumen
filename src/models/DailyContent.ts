import mongoose, { Schema, Document } from "mongoose";
import type { DailyData } from "../types";

export interface IDailyContent extends Document, DailyData {}

const JokeSchema = new Schema(
  {
    type: { type: String, required: true, enum: ["single", "twopart"] },
    joke: { type: String },
    setup: { type: String },
    delivery: { type: String },
  },
  { _id: false }
);

const PhotoSchema = new Schema(
  {
    imageBlob: { type: Buffer, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const PoemSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    lines: [{ type: String, required: true }],
  },
  { _id: false }
);

const ActivitySchema = new Schema(
  {
    activity: { type: String, required: true },
  },
  { _id: false }
);

const CatFactSchema = new Schema(
  {
    fact: { type: String, required: true },
  },
  { _id: false }
);

const DogFactSchema = new Schema(
  {
    fact: { type: String, required: true },
  },
  { _id: false }
);

const TriviaFactSchema = new Schema(
  {
    fact: { type: String, required: true },
  },
  { _id: false }
);

const ComicSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    altText: { type: String, required: true },
  },
  { _id: false }
);

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

export default mongoose.models.DailyContent ||
  mongoose.model<IDailyContent>("DailyContent", DailyContentSchema);
