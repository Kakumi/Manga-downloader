export class MangaDetails {
    track: string;
    source: string;
    thumbnail: string;
    link: string;
    title: string;
    description?: string;
    category: string[];
    status?: string;
    authors: string[];
    date?: string;

    /**
     * Define an object to read and set data easily
     * 
     * @param track URL of the source module (eg: https://yyy.zzz)
     * @param source Name of the source module (eg: Scan-fr.cc (FR))
     * @param thumbnail URL of the manga picture
     * @param link URL of the manga link
     * @param title Name of the manga
     * @param description Description of the manga
     * @param category List of categories of the manga
     * @param status Status of the manga
     * @param authors Authors of the manga
     * @param date Date of first publication
     */

    constructor(track: string, source: string, thumbnail: string, link: string, title: string, description: string, category: string[], status: string, authors: string[], date: string) {
        this.track = track;
        this.source = source;
        this.thumbnail = thumbnail;
        this.link = link;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.authors = authors;
        this.date = date;
    }
}