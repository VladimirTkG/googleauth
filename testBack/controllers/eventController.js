const { google } = require('googleapis');
const { validationResult } = require('express-validator');
const { authorizeToken } = require('../utils/googleAuth');
const Lead = require('../models/Lead');
const User = require('../models/User');


class eventController {

    async getCountsEvent(req, res) {
        try {
            const auth = authorizeToken();
            const { interior_user_id } = req;
            let counts = 0, all = 0;

            const leads = await Lead.find({ owner: interior_user_id })
            const user = await User.findOne({ _id: interior_user_id })

            const calendar = google.calendar({ version: 'v3', auth });
            for (let i = 0; i < leads.length; i++) {
                const calendarLeads = await calendar.events.list({
                    calendarId: 'primary',
                    maxResults: 300,
                    singleEvents: true,
                    orderBy: 'startTime',
                    q: `${leads[i].email} ${user.email}`
                })
                const events = calendarLeads.data.items;
                if (events.length) {
                    events.map((event, i) => {
                        let endDate;
                        if (event.start.date) {
                            endDate = new Date(event.end.date);
                        } else {
                            endDate = new Date(event.end.dateTime);
                        }
                        if (endDate.valueOf() > new Date().setMonth(new Date().getMonth() - 1)) {
                            counts++;
                        }
                    });
                    all += events.length
                }
            }
            return res.json({ last: counts, counts: all });
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: e });
        }
    }

    async getEvents(req, res) {
        try {

            let err = {};
            const errors = validationResult(req);
            const errorResult = errors.array();

            errorResult.forEach(elem => {
                err = elem;
            });

            if (!errors.isEmpty()) {
                return res.status(500).json({ message: err });
            }

            let dataForOutput = [];
            const { email } = req.query;

            const auth = authorizeToken();
            const { interior_user_id } = req;

            const user = await User.findOne({ _id: interior_user_id })
            const calendar = google.calendar({ version: 'v3', auth });
            calendar.events.list({
                calendarId: 'primary',
                maxResults: 20,
                singleEvents: true,
                q: `${email} ${user.email}`,
                orderBy: 'startTime',
            }, (err, response) => {
                if (err) return res.status(500).json({ message: `The API returned an error: ${err} ` });
                const events = response.data.items;
                if (events.length) {
                    events.map((event, i) => {
                        let startDate, endDate;
                        if (event.start.date) {
                            startDate = new Date(event.start.date);
                            endDate = new Date(event.end.date);
                        } else {
                            startDate = new Date(event.start.dateTime);
                            endDate = new Date(event.end.dateTime);
                        }
                        let eventTitle;
                        if (event.summary.indexOf('|') !== -1) {
                            eventTitle = event.summary.substring(0, event.summary.indexOf('|'))
                        } else if (event.summary.indexOf(user.email) !== -1) {
                            eventTitle = event.summary.substring(0, event.summary.indexOf(user.email))
                        } else {
                            eventTitle = event.summary
                        }
                        dataForOutput.push({
                            title: eventTitle,
                            description: event.description,
                            time: event.start.dateTime ? true : false,
                            startDate: startDate,
                            endDate: endDate,
                            start: event.start.date ? event.start.date : event.start.dateTime,
                            end: event.end.date ? event.end.date : event.end.dateTime,
                            meetLink: event.hangoutLink,
                            linkEvent: event.htmlLink
                        });
                    });
                    return res.json(dataForOutput);
                } else {
                    return res.status(500).json({ message: 'No upcoming events found.' });
                }
            });
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    async createEvent(req, res) {

        try {

            let err = {};
            const errors = validationResult(req);
            const errorResult = errors.array();

            errorResult.forEach(elem => {
                err = elem;
            });

            if (!errors.isEmpty()) {
                return res.status(500).json({ message: err });
            }

            const { interior_user_id } = req;

            const { title, description, dateStart, dateEnd, email } = req.body;

            let dateStartBerlin = new Date(dateStart);
            let dateEndBerlin = new Date(dateEnd);

            dateStartBerlin = new Date(dateStartBerlin).toISOString();
            dateEndBerlin = new Date(dateEndBerlin).toISOString();

            const user = User.findOne({ _id: interior_user_id })

            const event = {
                'summary': `${title} |${user.email}`,
                'location': 'Europe/Berlin',
                'description': `${description} `,
                'start': {
                    'dateTime': `${dateStartBerlin}`,
                    'timeZone': 'Europe/Berlin',
                },
                'end': {
                    'dateTime': `${dateEndBerlin}`,
                    'timeZone': 'Europe/Berlin',
                },
                'recurrence': [
                    'RRULE:FREQ=DAILY;COUNT=1'
                ],
                'attendees': [
                    { 'email': `${email}` },
                ],
                'conferenceData': {
                    'createRequest': {
                        'requestId': 'waeEWb12bsadv',
                        'conferenceSolutionKey': { type: "hangoutsMeet" },
                    },
                },
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        { 'method': 'email', 'minutes': 24 * 60 },
                        { 'method': 'popup', 'minutes': 10 },
                    ],
                },
            };
            const auth = authorizeToken();
            const calendar = google.calendar({ version: 'v3', auth });
            calendar.events.insert({
                auth: auth,
                calendarId: 'primary',
                resource: event,
                sendNotifications: true,
                conferenceDataVersion: 1
            }, function (err, event) {
                if (err) {
                    console.log('There was an error contacting the Calendar service: ' + err);
                    return res.status(err.code).json({ message: err });
                }
                res.status(200).json({ message: 'Event created' });
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: e });
        }
    }
}

module.exports = new eventController()



