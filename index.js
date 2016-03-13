var request = require('superagent'),
	cheerio = require('cheerio'),
	ical = require('ical-generator'),
    http = require('http')
	cal = ical({domain: 'iteatri.re.it', name: 'Teatri Reggio'});

setInterval(loadCalendar, 10000);
loadCalendar();
	
http.createServer((req, res) => cal.serve(res)).listen(process.env.PORT || 3000);

function loadCalendar() {
	request.get('http://www.iteatri.re.it/Calendario.jsp')
		.type('text/html')
		.end((err, res) => {
			if(err) throw err;
			var $ = cheerio.load(res.text);
			var script = $('#calendarioEventi script').text();
			var events = /events: (\[[\s\S.]+}\,\s+\])/.exec(script);
			
			cal.clear();
			
			cal.events(eval(events[1]).map(event => (event)));
		});

}