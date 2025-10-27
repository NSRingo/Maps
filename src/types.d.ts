export interface Settings {
    GeoManifest?: {
    Dynamic?: {
            Config?: {
            /**
                 * [动态配置] 资源清单的国家或地区代码
                 *
                 * 此选项影响“地图”整体配置内容，包括以下的地图功能与服务。
                 *
                 * @remarks
                 *
                 * Possible values:
                 * - `'AUTO'` - 🇺🇳自动（跟随用户当前所在地区）
                 * - `'CN'` - 🇨🇳中国大陆
                 * - `'HK'` - 🇭🇰中国香港
                 * - `'TW'` - 🇹🇼中国台湾
                 * - `'SG'` - 🇸🇬新加坡
                 * - `'US'` - 🇺🇸美国
                 * - `'JP'` - 🇯🇵日本
                 * - `'AU'` - 🇦🇺澳大利亚
                 * - `'GB'` - 🇬🇧英国
                 * - `'KR'` - 🇰🇷韩国
                 * - `'CA'` - 🇨🇦加拿大
                 * - `'IE'` - 🇮🇪爱尔兰
                 *
                 * @defaultValue "CN"
                 */
                CountryCode?: 'AUTO' | 'CN' | 'HK' | 'TW' | 'SG' | 'US' | 'JP' | 'AU' | 'GB' | 'KR' | 'CA' | 'IE';
};
};
};
    UrlInfoSet?: {
    /**
         * [URL信息集] 调度器
         *
         * 地点数据接口，此选项影响公共指南，兴趣点(POI)与位置信息等功能。
         *
         * @remarks
         *
         * Possible values:
         * - `'AUTO'` - 🇺🇳自动（随[动态配置]版本自动选择）
         * - `'AutoNavi'` - 🧭高德（🇨🇳:互动百科/大众点评/携程 | 🇺🇳:维基百科/Yelp/Booking）
         * - `'Apple'` - Apple（维基百科/Yelp/Booking）
         *
         * @defaultValue "AutoNavi"
         */
        Dispatcher?: 'AUTO' | 'AutoNavi' | 'Apple';
    /**
         * [URL信息集] 导航与ETA
         *
         * 导航与ETA服务接口，此选项影响导航与ETA(到达时间)等功能。
         *
         * @remarks
         *
         * Possible values:
         * - `'AUTO'` - 🇺🇳自动（随[动态配置]版本自动选择）
         * - `'AutoNavi'` - 🧭高德（🇨🇳:高德地图 | 🇺🇳:TomTom）
         * - `'Apple'` - Apple（🇨🇳:🈚️ | 🇺🇳:TomTom）
         *
         * @defaultValue "AutoNavi"
         */
        Directions?: 'AUTO' | 'AutoNavi' | 'Apple';
    /**
         * [URL信息集] 评分和照片
         *
         * 评分和照片服务接口，此选项影响评分和照片服务以及照片使用。
         *
         * @remarks
         *
         * Possible values:
         * - `'AUTO'` - 🇺🇳自动（随[动态配置]版本自动选择）
         * - `'AutoNavi'` - 🧭高德（🇨🇳:🈶️但未开放 | 🇺🇳:🈚️）
         * - `'Apple'` - Apple（🇨🇳:🈚️ | 🇺🇳:🈶️）
         *
         * @defaultValue "Apple"
         */
        RAP?: 'AUTO' | 'AutoNavi' | 'Apple';
    /**
         * [URL信息集] 定位漂移
         *
         * 定位漂移修正服务接口，控制定位漂移和🧭指南针与📍坐标的经纬度。
         *
         * @remarks
         *
         * Possible values:
         * - `'AUTO'` - 🇺🇳自动（随[动态配置]版本自动选择）
         * - `'AutoNavi'` - 🧭高德（🈚️坐标，使用🇨🇳GCJ-02坐标）
         * - `'Apple'` - Apple（🈶️坐标，使用🇺🇳WGS-84坐标）
         *
         * @defaultValue "AUTO"
         */
        LocationShift?: 'AUTO' | 'AutoNavi' | 'Apple';
};
    TileSet?: {
    /**
         * [瓦片数据集] 地球图像
         *
         * 此选项影响地球视图下行政区划、地貌等信息的显示。
         *
         * @remarks
         *
         * Possible values:
         * - `'AUTO'` - 🇺🇳自动（随[动态配置]版本自动选择）
         * - `'AutoNavi'` - 🧭高德版（主要显示国家与国界）
         * - `'Apple'` - Apple（主要显示城市与地貌）
         *
         * @defaultValue "AUTO"
         */
        Earth?: 'AUTO' | 'AutoNavi' | 'Apple';
    /**
         * [瓦片数据集] 道路图像与四处看看
         *
         * 此选项影响卫星视图下的道路图像与四处看看可用路段。
         *
         * @remarks
         *
         * Possible values:
         * - `'AUTO'` - 🇺🇳自动（随[动态配置]版本自动选择）
         * - `'CN'` - 🇨🇳中国（🇨🇳:卫星视图道路正确 | 🇺🇳:无四处看看）
         * - `'XX'` - Apple（🇨🇳:卫星视图道路偏移 | 🇺🇳:有四处看看）
         *
         * @defaultValue "AUTO"
         */
        Roads?: 'AUTO' | 'CN' | 'XX';
    /**
         * [瓦片数据集] 卫星图像
         *
         * 此选项影响所列位图、影像与模型数据。
         *
         * @remarks
         *
         * Possible values:
         * - `'AUTO'` - 🇺🇳自动（随[动态配置]版本自动选择）
         * - `'HYBRID'` - 混合（🇨🇳:2D较新 | 🇺🇳:主要城市3D）
         * - `'CN'` - 🇨🇳中国四维（🇨🇳:2D较新 | 🇺🇳:🈚️）
         * - `'XX'` - 🇺🇳DigitalGlobe（🇨🇳:2D较旧 | 🇺🇳:2D+主要城市3D）
         *
         * @defaultValue "HYBRID"
         */
        Satellite?: 'AUTO' | 'HYBRID' | 'CN' | 'XX';
};
    /**
     * [调试] 日志等级
     *
     * 选择脚本日志的输出等级，低于所选等级的日志将全部输出。
     *
     * @remarks
     *
     * Possible values:
     * - `'OFF'` - 关闭
     * - `'ERROR'` - ❌ 错误
     * - `'WARN'` - ⚠️ 警告
     * - `'INFO'` - ℹ️ 信息
     * - `'DEBUG'` - 🅱️ 调试
     * - `'ALL'` - 全部
     *
     * @defaultValue "WARN"
     */
    LogLevel?: 'OFF' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'ALL';
}
