# Manga-downloader
Get manga scan from bunch of sites (Multilanguages)

[![Manga Downloader by Damien Brebion](https://img.youtube.com/vi/wmKw59L2YVw/0.jpg)](https://www.youtube.com/watch?v=wmKw59L2YVw "Manga Downloader by Damien Brebion")

# How to install
## Step 1
Download the project with 
```
git clone https://github.com/Kakumi/Manga-downloader.git
```

## Step 2
Install dependencies with
```
npm install
```

## Step 3
Execute `start.bat` or with `npm run start` command.

# How to create module
You can create your own custom module. We recommand you to fork this project to create your own and ask to add to this repository.

## Step 1
Create a file into `/modules/` with the name of your module (website). for example : `manga.fr.ts`

## Step 2
Use the code below to create your module
```typescript
const cheerio = require('cheerio');
const got = require('got');

import { MangaDetails } from "../models/mangaDetails";
import { MangaChapter } from "../models/mangaChapter";
import { MainClass } from "../models/sourceModel";

//Don't forget to change the module name
class ModuleName extends MainClass {
    getName(): string {
        //Return the name of the website
        return "Module";
    }

    getLink(): string {
        //Return the link of the website
        return "https://module.com";
    }

    getSearchLink(mangaName: string): string {
        //Return the link to make the research
        const mangaFormatted = this.formatUrl(mangaName);

        return "https://module.com/?search_type=1&name=" + mangaFormatted;
    }

    async searchMangas(searchedLink: string, $: any): Promise<MangaDetails[]> {
        var data: MangaDetails[] = [];

        const track: string = this.getLink();
        const source: string = this.getName();

        //With cheerio, get the response with param "$", get infos to fill in the object MangaDetails and return it.
        //This fonction return an array to display to the user, all mangas available for the manga he asked.
        //You can see others module to know how does it works.

        return Promise.resolve(data);
    }

    async searchChapters(searchedLink: string, $: any): Promise<MangaChapter[]> {
        const data: MangaChapter[] = [];
        
        //With cheerio, get the response with param "$", get infos to fill in the object MangaChapter and return it.
        //This fonction return an array to display to the user, all chapters available for the manga he asked.
        //You can see others module to know how does it works.

        return Promise.resolve(data);
    }

    async searchChapterImages(searchedLink: string, $: any): Promise<string[]> {
        const images: string[] = [];

        //With cheerio, get the response with param "$", get all images to fill in the array and return it.
        //This fonction return an array of images URL to download it later in a specific folder.
        //You can see others module to know how does it works.

        return Promise.resolve(images);
    }
}

//Don't forget to change the module name
module.exports.class = new ModuleName();
```

## Step 3
When your class is finished. Add it to the main module loader in `/modules/index.ts`

```typescript
//Import modules
const ModuleName = require('./customModule');

const services: MainClass[] = [
    ModuleName.class
];
```

## Step 4
It must be working ! If you have any problem or suggestion feel free to update the code and add functionalities.

# Loger
There is a loger in the project, it will help you to find any error and get history of what you did. Basically it shows errors, warnings and informations. For example when the service is loading / loaded or when you are downloading images, ...<br><br>
You can use it in 2 ways :

## Way 1 : In a module
Just call your parent

```typescript
this.log("My message");
this.warn("My warning");
this.error("My error");
```

## Way 2 : In a file
Get the instance and use it

```typescript
const LogerUtils = require('../utils/loger');
const loger = new LogerUtils([fileName[, folderName]]);

loger.info("My message"[, TAG]);
loger.warn("My warning"[, TAG]);
loger.error("My error"[, TAG]);
```

# Todo
We would like to add these functionnalities:
1. Add history to download chapter easily
2. Allow the user to cancel and go to the previous step
3. Allow to download several chapters at the same time
4. Get complete details of manga you searched. Actually you can get details of your searched in `data/<search_name>.json`
