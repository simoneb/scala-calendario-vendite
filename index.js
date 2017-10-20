const request = require('superagent')
const cheerio = require('cheerio')
const ical = require('ical-generator')
const http = require('http')

cal = ical({domain: 'iteatri.re.it', name: 'Teatri Reggio', ttl: 60 * 60 /* 1 hour*/})

setInterval(loadCalendar, 60 * 1000 /* 1 minute */)
loadCalendar()

http.createServer((req, res) => cal.serve(res)).listen(process.env.PORT || 3000)

function loadCalendar () {
  request.get('http://www.iteatri.re.it/Calendario.jsp')
    .type('text/html')
    .end((err, res) => {
      if (err) throw err
      const $ = cheerio.load(res.text)
      const script = $('#calendarioEventi').find('script').text()
      const [, eventsJsString] = /events: (\[[\s\S.]+}\,\s+\])/.exec(script)

      cal.events().length = 0

      cal.events(
        eval(eventsJsString)
          .map(event => ({
            start: new Date(event.start),
            end: new Date(event.end),
            summary: event.title,
            description: event.title,
            location: event.luogo,
            url: event.url,
            allDay: true
          }))
          .filter(event => (Math.abs(event.end - event.start) / 1000 / 60 / 60 / 24) < 2)
      )
    })

}