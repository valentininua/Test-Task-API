const FIRST_NAMES = [
  'Alex',
  'Maria',
  'John',
  'Anna',
  'Ivan',
  'Olga',
  'Dmitry',
  'Sofia',
  'Max',
  'Kate',
];
const LAST_NAMES = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Ivanov', 'Petrova', 'Sokolov'];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDigits(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += String(randInt(0, 9));
  return s;
}

function randomDateOfBirth(): Date {
  const year = randInt(1950, 2005);
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  return new Date(Date.UTC(year, month, day));
}

function randomName(): string {
  const first = FIRST_NAMES[randInt(0, FIRST_NAMES.length - 1)]!;
  const last = LAST_NAMES[randInt(0, LAST_NAMES.length - 1)]!;
  return `${first} ${last}`;
}

function randomEmail(): string {
  const local = `user.${Date.now().toString(36)}.${randomDigits(6)}`.toLowerCase();
  return `${local}@example.com`;
}

function randomPhone(): string {
  return `+1${randomDigits(10)}`;
}

export function randomUser() {
  return {
    name: randomName(),
    email: randomEmail(),
    phone: randomPhone(),
    dateOfBirth: randomDateOfBirth(),
  };
}

