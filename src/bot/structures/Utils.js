const { search, getVideo, getPlaylist } = require('youtube-sr').default;
const { getPreview } = require('spotify-url-info');

class Utils {
    /**
     * Check if string is url
     * @param {String} string
     * @returns {Boolean}
     */
    static isUrl(string) {
        return /(https?:\/\/[^ ]*)/.test(string);
    }

    /**
     * Search videos
     * @param {String} query
     * @param {Integer} limit
     * @returns {Array<Object>}
     */
    static async search(query, limit) {
        const videos = await search(query, { limit: limit ?? 25 });

        return videos.map(video => ({ name: video.title, value: video.url }));
    }

    /**
     * Get a video
     * @param {String} url
     * @returns {Object}
     */
    static async getVideo(url) {
        let video;

        if (/^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/g.test(url) && !/^.*(list=)([^#\&\?]*).*/gi.test(url)) video = [await getVideo(url)];
        if (/^.*(list=)([^#\&\?]*).*/gi.test(url)) {
            video = await (await (await getPlaylist(url)).fetch()).videos;
        }
        else if (/^.*(https:\/\/open\.spotify\.com\/track)([^#\&\?]*).*/gi.test(url)) {
            const preview = await getPreview(url);
            const videoName = `${preview.title} - ${preview.artist}`;
            const videoUrl = await (Utils.search(videoName, 1))[0].value;
            if(!videoUrl) videoUrl = await (Utils.search('Never gonna give you up', 1))[0].value;

            video = [await Utils.getVideo(videoUrl)];
        }

        return video;
    }
}

module.exports = Utils;
