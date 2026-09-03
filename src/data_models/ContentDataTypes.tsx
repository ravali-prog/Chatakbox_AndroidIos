// import com.fasterxml.jackson.databind.ObjectMapper; // version 2.11.1
// import com.fasterxml.jackson.annotation.JsonProperty; // version 2.11.1
/* ObjectMapper om = new ObjectMapper();
Root root = om.readValue(myJson   , Root.  interface); */
export interface Clip {

    groupId: string;
    seriesId: string;
    season: string;
    episode: string;
    id: string;
    title: string;
    desc: string;
    ldesc: string;
    distributor: string;
    production: string;
    directors: string;
    producers: string;
    actors: string;
    genre: string;
    lang: string;
    keywords: string;
    thumbnail: Thumbnail;
    media: Media;
    rating: string;
    certificate: string;
    allowedCountries: string;
    restrictedCountries: string;
    release_date: string;
    expiry_date: string;
    type: string;
    resume :string
}

export interface ContentData {
    title: string;
    parentId: string;
    groupId: string;
    desc: string;
    thumbnail: Thumbnail;
    containerColor: string;
    container: string;
    rendertype: string;
    imgper: string;
    imgwratio: string;
    imghratio: string;
    itemHighLightText: string;
    itemHighLightColor: string;
    type: string;
    list: List[];
    clips: Clip[];
    isHistory:boolean;
}

export interface List {
    groupId: string;
    seriesId: string;
    title: string;
    desc: string;
    ldesc: string;
    distributor: string;
    production: string;
    directors: string;
    producers: string;
    actors: string;
    genre: string;
    lang: string;
    keywords: string;
    thumbnail: Thumbnail;
    media: Media;
    rating: string;
    certificate: string;
    allowedCountries: string;
    restrictedCountries: string;
    release_date: string;
    expiry_date: string;
    clips: Clip[];
    type: string;
    parentId: string;
    containerColor: string;
    container: string;
    rendertype: string;
    imgper: string;
    imgwratio: string;
    imghratio: string;
    itemHighLightText: string;
    itemHighLightColor: string;
}

export interface Media {
    trailer: Trailer[];
    video: Video[];
}

export interface ContentResponse {
    data: ContentData[];
    resultcode :string,
    resultmsg : string
}

export interface Thumbnail {
    t2x3: string;
    t16x9: string;
    t3x4: string;
    t5x3: string;
}

export interface Trailer {
    format: string;
    url: string;
}

export interface Video {
    format: string;
    url: string;
}

