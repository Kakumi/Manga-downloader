export class MangaChapter {
    number: string;
    name: string;
    link: string;

    /**
     * Define an object to get all chapters for a selected manga
     * 
     * @param number Chapter number
     * @param name Chapter name
     * @param link Chapter link
     */

    constructor(number: string, name: string, link: string) {
        this.number = number;
        this.name = name;
        this.link = link;
    }
}