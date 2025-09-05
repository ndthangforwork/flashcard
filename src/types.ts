export interface Card {
  front: string;
  back: string;
}

export interface FlashcardList {
  _id: string;
  name: string;
  cards: Card[];
}