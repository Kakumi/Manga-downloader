import { MangaDetails } from "./mangaDetails";
import { MangaChapter } from "./mangaChapter";

export abstract class MainClass {

    /**
     * Get name of the module
     * 
     * @returns Return the module's name
     */
    abstract getName(): string;

    /**
     * Get link of the module's service
     * 
     * @returns Return a link
     */
    abstract getLink(): string;

    /**
     * 
     * @param manga Name of the manga
     * 
     * @returns Return the manga name formatted for the URL (eg: one_piece)
     */
    formatUrl(manga: string): string {
        //By default
        return manga.trim().toLowerCase().replace(" ", "-");
    }

    /**
     * Search a manga base on the user input, it returns a list of element found
     * 
     * @param manga Name of the manga to search
     * 
     * @returns Return an array of 'MangaDetails'
     */
    abstract search(manga: string): Promise<MangaDetails[]>;

    /**
     * Get all chapters available for a manga
     * 
     * @param mangaDetails MangaDetails object
     * 
     * @returns Return an array of 'MangaChapters'
     */
    abstract getChapters(mangaDetails: MangaDetails): Promise<MangaChapter[]>;

    /**
     * 
     * @param mangaChapter MangaChapter object
     * 
     * @returns Return an array of image URL
     */
    abstract downloadChapters(mangaChapter: MangaChapter): Promise<string[]>;
}