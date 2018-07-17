import { Participant } from './participant';

export interface Event {
    name: string;
    duedate: string;
    participants: Participant[];
    key: string;
    fondie: boolean;
    order: {
        items: any[];
        complements: any[];
        prices: any[];
        maxCom: number;
    };

}