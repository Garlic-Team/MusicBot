const { search, getVideo } = require('youtube-sr').default;

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
        const video = await getVideo(url);

        return video;
    }
}

module.exports = Utils;
