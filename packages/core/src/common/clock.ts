// Horloge injectable : les règles datées se testent sans attendre.
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();
