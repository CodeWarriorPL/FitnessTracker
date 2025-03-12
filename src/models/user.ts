import { Training } from './training';
export class User {

    id?: number;

    username?: string;

    email: string;

    password: string;

    traings? : Training[];
    token?: string;
}
