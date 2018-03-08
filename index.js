const request = require('superagent')
const cheerio = require('cheerio')
const ical = require('ical-generator')
const http = require('http')
const moment = require('moment')

moment.locale('IT-it')

cal = ical({
  domain: 'www.teatroallascala.org',
  name: 'Scala Calendario Vendite',
  ttl: 60 * 60 /* 1 hour*/
})

http.createServer((req, res) => serveCalendar(res)).listen(process.env.PORT || 3000)

function serveCalendar (httpRes) {
  request.get('http://www.teatroallascala.org/it/biglietteria/biglietti-tariffe/calendario-vendite.html')
    .type('text/html')
    .end((err, res) => {
      if (err) throw err
      const $ = cheerio.load(res.text)

      const events = $('table')
        .find('tr')
        .filter((_, e) => /\d{4}/.test($(e).find('td').eq(1).find('p').text()))
        .map((_, e) => ({
          name: $(e).find('td').eq(0).find('p').text(),
          date: moment($(e).find('td').eq(1).find('p').text(), 'dddd DD MMMM YYYY')
        })).toArray()

      cal.events().length = 0

      cal.events(
        events
          .map(event => ({
            start: event.date.toDate(),
            // end: new Date(event.end),
            summary: event.name,
            description: event.name,
            allDay: true
          }))
          // .filter(event => (Math.abs(event.end - event.start) / 1000 / 60 / 60 / 24) < 2)
      )

      cal.serve(httpRes)
    })

}