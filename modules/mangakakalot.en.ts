const cheerio = require('cheerio');
const got = require('got');

import { MangaDetails } from "../models/mangaDetails";
import { MangaChapter } from "../models/mangaChapter";
import { MainClass } from "../models/sourceModel";

class NiaddFr extends MainClass {
    getName(): string {
        return "MangaNelo (EN)";
    }

    getLink(): string {
        return "https://manganelo.com/";
    }

    formatUrl(manga: string): string {
        return manga.trim().toLowerCase().replace(/\s/gmi, "_");
    }

    getSearchLink(mangaName: string): string {
        const mangaFormatted = this.formatUrl(mangaName);

        return "https://manganelo.com/search/story/" + mangaFormatted;
    }

    async searchMangas(searchedLink: string, $: any): Promise<MangaDetails[]> {
        var data: MangaDetails[] = [];

        const track: string = this.getLink();
        const source: string = this.getName();

        var link: string = "/";
        var chapterLink: string = "/";
        var thumbnail: string = "/";
        var title: string = "/";
        var description: string = "/";
        var status: string = "/";
        var date: string = "/";
        const categories: string[] = [];
        const autheurs: string[] = [];

        const mangas = await $('.search-story-item');
        for(var i = 0; i < mangas.length; i++) {
            var elem = mangas.get(i);

            link = elem.children[1].attribs.href;
            chapterLink = link;
            thumbnail = elem.children[1].children[1].attribs.src;

            title = elem.children[3].children[1].children[1].children[0].data;
            
            var responseManga = await got(link);
            if (responseManga.statusCode === 200) {
                const $ = cheerio.load(responseManga.body);

                await $('.story-info-right').each((i: Number, elem: any) => {
                    autheurs.push(elem.children[3].children[1].children[3].children[3].children[1].children[0].data);
                    status = elem.children[3].children[1].children[5].children[3].children[0].data;

                    for(var type of elem.children[3].children[1].children[7].children[3].children) {
                        if (type.name == 'a') {
                            categories.push(type.children[0].data);
                        }
                    }
                });
            }

            data.push(new MangaDetails(track, source, thumbnail, link, chapterLink, title, description, categories, status, autheurs, date));
        }

        return Promise.resolve(data);
    }

    async searchChapters(searchedLink: string, $: any): Promise<MangaChapter[]> {
        const data: MangaChapter[] = [];

        await $('.panel-story-chapter-list .row-content-chapter li').each((i: Number, elem: any) => {
            data.push(new MangaChapter(
                elem.children[1].children[0].data,
                elem.children[1].children[0].data,
                elem.children[1].attribs.href
            ));
        });

        return Promise.resolve(data);
    }

    async searchChapterImages(searchedLink: string, $: any): Promise<string[]> {
        const images: string[] = [];

        await $('.container-chapter-reader img').each((i: Number, elem: any) => {
            images.push(elem.attribs.src);
        });

        return Promise.resolve(images);
    }
}

module.exports.class = new NiaddFr();