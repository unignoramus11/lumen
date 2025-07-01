export interface PhotoData {
  imageUrl: string;
  label: string;
}

export interface Poem {
  title: string;
  author: string;
  lines: string[];
}

export interface JokeSingle {
  type: "single";
  joke: string;
}

export interface JokeTwoPart {
  type: "twopart";
  setup: string;
  delivery: string;
}

export type Joke = JokeSingle | JokeTwoPart;

export interface Activity {
  activity: string;
}

export interface CatFact {
  fact: string;
}

export interface DogFact {
  fact: string;
}

export interface TriviaFact {
  fact: string;
}

export interface ComicPanel {
  imageUrl: string;
  altText: string;
}

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
