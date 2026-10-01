// خادم Xtream وهمي للاختبار المحلي (player_api.php)
const http = require('http');
const qs = require('querystring');

const data = {
  liveCats: [{ category_id: '1', category_name: 'وطني' }, { category_id: '9', category_name: 'رياضة' }],
  vodCats: [{ category_id: '2', category_name: 'عربي' }],
  seriesCats: [{ category_id: '3', category_name: 'دراما' }, { category_id: '8', category_name: 'تركية' }],
  live: [
    { stream_id: 11, name: 'قناة الجزائر الأولى', category_id: '1', stream_icon: '' },
    { stream_id: 12, name: 'قناة النهر', category_id: '1', stream_icon: '' },
    { stream_id: 13, name: 'beIN Sports 1', category_id: '9', stream_icon: '' }
  ],
  vod: [
    { stream_id: 21, name: 'فيلم النمر', category_id: '2', container_extension: 'mp4', cover: '' },
    { stream_id: 22, name: 'فيلم الصحراء', category_id: '2', container_extension: 'mp4', cover: '' }
  ],
  series: [
    { series_id: 7, name: 'مسلسل النور', category_id: '3', cover: '' },
    { series_id: 8, name: 'مسلسل الوفاء', category_id: '3', cover: '' }
  ],
  seriesInfo: {
    7: {
      info: { plot: 'قصة عائلة جزائرية عبر الأجيال' },
      episodes: {
        '1': [
          { id: 101, title: 'البداية', episode_num: 1, container_extension: 'mp4', info: { duration: '45:10' } },
          { id: 102, title: 'التحول', episode_num: 2, container_extension: 'mp4', info: { duration: '44:00' } },
          { id: 103, title: 'الأزمة', episode_num: 3, container_extension: 'mp4', info: { duration: '46:20' } }
        ],
        '2': [
          { id: 201, title: 'عودة', episode_num: 1, container_extension: 'mp4', info: { duration: '45:00' } },
          { id: 202, title: 'سر', episode_num: 2, container_extension: 'mp4', info: { duration: '43:30' } }
        ],
        '3': [
          { id: 301, title: 'الخاتمة', episode_num: 1, container_extension: 'mp4', info: { duration: '50:00' } }
        ]
      }
    }
  }
};

const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const q = Object.fromEntries(u.searchParams.entries());
  const j = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
  if (!u.pathname.includes('player_api.php')) return j({ error: 'bad_path' });
  switch (q.action) {
    case 'get_live_categories': return j(data.liveCats);
    case 'get_vod_categories': return j(data.vodCats);
    case 'get_series_categories': return j(data.seriesCats);
    case 'get_live_streams': return j(data.live.filter(s => String(s.category_id) === String(q.category_id)));
    case 'get_vod_streams': return j(data.vod.filter(s => String(s.category_id) === String(q.category_id)));
    case 'get_series': return j(data.series.filter(s => String(s.category_id) === String(q.category_id)));
    case 'get_series_info': return j(data.seriesInfo[q.series_id] || { info: {}, episodes: {} });
    default: return j([]);
  }
});
srv.listen(8899, '127.0.0.1', () => console.log('xtream mock على 8899'));
module.exports = srv;
