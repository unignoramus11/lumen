/**
 * @file This file defines the TypeScript interfaces and types used throughout the Lumen Sigma application.
 * These definitions ensure type safety and provide clear contracts for data structures
 * exchanged between different parts of the application, including API responses and component props.
 */

/**
 * Interface for photo-related data.
 * @property {string} imageUrl - The URL of the image.
 * @property {string} label - The caption or description for the image.
 */
export interface PhotoData {
  imageUrl: string;
  label: string;
}

/**
 * Interface for poem data.
 * @property {string} title - The title of the poem.
 * @property {string} author - The author of the poem.
 * @property {string[]} lines - An array of strings, where each string represents a line of the poem.
 */
export interface Poem {
  title: string;
  author: string;
  lines: string[];
}

/**
 * Interface for a single-part joke.
 * @property {"single"} type - Indicates the joke is a single part.
 * @property {string} joke - The text of the joke.
 */
export interface JokeSingle {
  type: "single";
  joke: string;
}

/**
 * Interface for a two-part joke.
 * @property {"twopart"} type - Indicates the joke has two parts.
 * @property {string} setup - The setup part of the joke.
 * @property {string} delivery - The punchline or delivery part of the joke.
 */
export interface JokeTwoPart {
  type: "twopart";
  setup: string;
  delivery: string;
}

/**
 * Type alias for a Joke, which can be either a single-part or a two-part joke.
 */
export type Joke = JokeSingle | JokeTwoPart;

/**
 * Interface for activity data.
 * @property {string} activity - The description of the activity.
 */
export interface Activity {
  activity: string;
}

/**
 * Interface for cat fact data.
 * @property {string} fact - The cat fact text.
 */
export interface CatFact {
  fact: string;
}

/**
 * Interface for dog fact data.
 * @property {string} fact - The dog fact text.
 */
export interface DogFact {
  fact: string;
}

/**
 * Interface for trivia fact data.
 * @property {string} fact - The trivia fact text.
 */
export interface TriviaFact {
  fact: string;
}

/**
 * Interface for comic panel data.
 * @property {string} imageUrl - The URL of the comic image.
 * @property {string} altText - The alternative text for the comic image.
 */
export interface ComicPanel {
  imageUrl: string;
  altText: string;
}

/**
 * Interface for the complete daily content data.
 * This aggregates all the different types of content displayed on a given day.
 * @property {string} date - The date of the content in YYYY-MM-DD format.
 * @property {string} headline - The main headline for the day's edition.
 * @property {PhotoData} photo - The featured photograph data.
 * @property {Poem} poem - The poem of the day.
 * @property {Joke} joke - The joke of the day.
 * @property {Activity} activity - The suggested activity for the day.
 * @property {CatFact} catFact - The cat fact of the day.
 * @property {DogFact} dogFact - The dog fact of the day.
 * @property {TriviaFact} triviaFact - The trivia fact of the day.
 * @property {ComicPanel} comic - The comic panel for the day.
 */
export interface DailyData {
  date: string;
  headline: string;
  photo: PhotoData;
  poem: Poem;
  joke: Joke;
  activity: Activity;
  catFact: CatFact;
  dogFact: DogFact;
  triviaFact: TriviaFact;
  comic: ComicPanel;
}
