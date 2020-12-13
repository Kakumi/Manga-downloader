import { MangaDetails } from "./mangaDetails";
import { MangaChapter } from "./mangaChapter";
const LogerUtils = require('../utils/loger');
const loger = new LogerUtils();
var fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const got = require('got');

export abstract class MainClass {

    /**
     * Write info in the logger
     */
    log(message: string) {
        return loger.info(message, this.getName());
    }

    /**
     * Write warning in the logger
     */
    warn(message: string) {
        return loger.warn(message, this.getName());
    }

    /**
     * Write error in the logger
     */
    error(message: string) {
        return loger.error(message, this.getName());
    }

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
        return manga.trim().toLowerCase().replace(/\s/gmi, "-");
    }

    /**
     * Return a link for the search
     * 
     * @returns Return a link
     */
    abstract getSearchLink(mangaName: string): string;

    /**
     * Return a link for the search
     * 
     * @param searchedLink Link of the request
     * @param $ Get the cheerio response body
     * 
     * @returns @returns Return an array of 'MangaDetails'
     */
    abstract searchMangas(searchedLink: string, $: any): Promise<MangaDetails[]>;

    /**
     * Get all chapters from a manga details
     * 
     * @param searchedLink Link of the request
     * @param $ Get the cheerio response body
     * 
     * @returns @returns Return an array of 'MangaDetails'
     */
    abstract searchChapters(searchedLink: string, $: any): Promise<MangaChapter[]>;

    /**
     * Download all images from a chapter
     * 
     * @param searchedLink Link of the request
     * @param $ Get the cheerio response body
     */
    abstract searchChapterImages(searchedLink: string, $: any): Promise<string[]> ;

    /**
     * Search a manga base on the user input, it returns a list of element found
     * 
     * @param manga Name of the manga to search
     * 
     * @returns Return an array of 'MangaDetails'
     */
    async getMangas(manga: string): Promise<MangaDetails[]> {
        var data: MangaDetails[] = [];
        const link = this.getSearchLink(manga);

        try {
            this.log("Searching on " + link + "...");
            const response = await got(link);
            if (response.statusCode === 200) {
                const $ = cheerio.load(response.body);

                data = await this.searchMangas(link, $);

                this.log("Search done ! Success !");
            } else {
                this.warn("Search done ! Response code is not 200 ! (" + response.statusCode + ")");
            }
        } catch(e) {
            this.error(e.message);
        } finally {
            return Promise.resolve(data);
        }
    }

    /**
     * Get all chapters available for a manga
     * 
     * @param mangaDetails MangaDetails object
     * 
     * @returns Return an array of 'MangaChapters'
     */
    async getChapters(mangaDetails: MangaDetails): Promise<MangaChapter[]> {
        var data: MangaChapter[] = [];

        this.log("Loading chapters list...");
        const response = await got(mangaDetails.chapterLink);
        if (response.statusCode === 200) {
            const $ = cheerio.load(response.body);

            data = await this.searchChapters(mangaDetails.chapterLink, $);

            this.log("Getting chapters list done !");
        } else {
            this.warn("Getting chapters list failed ! Response code is not 200 ! (" + response.statusCode + ")");
        }

        return Promise.resolve(data);
    }

    /**
     * Download a chapter
     * 
     * @param mangaChapter MangaChapter object
     * 
     * @returns Return an array of image URL
     */
    async getChaptersImages(mangaChapter: MangaChapter) {
        var data: string[] = [];

        this.log("Loading chapter...");
        const response = await got(mangaChapter.link);
        if (response.statusCode === 200) {
            var $ = cheerio.load(response.body);

            data = await this.searchChapterImages(mangaChapter.link, $);

            this.log("Images loaded !");
        } else {
            this.warn("Getting chapter failed ! Response code is not 200 ! (" + response.statusCode + ")");
        }

        return Promise.resolve(data);
    }
}