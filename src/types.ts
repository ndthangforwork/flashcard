export interface CardType {
  front: string;
  back: string;
}

export interface FlashcardList {
  _id: string;
  name: string;
  cards: CardType[];
}