const { google } = require('googleapis');
const { convert } = require('html-to-text');
const { validationResult } = require('express-validator');
const { createMimeMessage } = require('mimetext');
const { authorizeToken } = require('../utils/googleAuth');
const SampleMessage = require('../models/SampleMessage');
const Lead = require('../models/Lead');
const { response } = require('express');
const User = require('../models/User');
class messageController {

    async getMessages(req, res) {
        try {

            let err = {};
            const errors = validationResult(req);
            const errorResult = errors.array();

            errorResult.forEach(elem => {
                err = elem;
            });

            if (!errors.isEmpty()) {
                return res.status(200).json({ message: err, err: true });
            }

            let dataForOutput = []
            const email = req.query.email;
            const { interior_user_id } = req;

            const user = await User.findOne({ _id: interior_user_id });
            const lead = await Lead.findOne({ email: email });

            const leadUnread = lead.unreadId;
            let leadUnreadData = leadUnread
            if (leadUnread.length >= 1) {
                leadUnread.forEach((el, key) => {
                    if (el === interior_user_id.toString()) {
                        leadUnreadData.splice(key, 1)
                    }
                })
            }
            const userEmail = user.email;

            Lead.findOneAndUpdate({ email: email }, { unreadId: leadUnreadData }, { new: true }, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!", err);
                    return res.status(500).json({
                        message: "Something wrong when updating data!"
                    });
                }
            });

            const auth = authorizeToken();
            const gmail = google.gmail({ version: 'v1', auth });

            gmail.users.messages.list({
                userId: 'me',
                maxResults: 50,
                q: `{from:${email} to:${email} }`
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const message = res.data.messages;
                getMessageBody(message, auth)
            })

            async function getMessageBody(message, auth) {
                // res.json(message)
                const gmail = google.gmail({ version: 'v1', auth });
                if (message) {
                    for (let i = message.length - 1; i >= 0; i--) {
                        await gmail.users.messages.get({
                            userId: 'me',
                            id: message[i].id
                        })
                            .then(result => { getAllMessage(result, i, message.length - 1) })
                            .catch(err => { console.log(err) })
                    }
                    return res.json(dataForOutput)
                } else {
                    return res.status(200).json({ message: 'Message not found', empty: true })
                }
            }

            function getAllMessage(result, id, first) {
                let dateOutMes, recepient, text2, subjectFirst, readBool = false, myMessageBool = false;

                result.data.payload.headers.forEach(el => {
                    if (el.name === 'Date') {
                        dateOutMes = new Date(el.value);

                    } else if (el.name === 'To') {
                        if (el.value.indexOf('irm@dkv.global') !== -1) {
                            const data = result.data.payload.parts ? result.data.payload.parts[0].body.data : result.data.payload.body.data;
                            if (result.data.payload.parts) {
                                text2 = Buffer.from(data, 'base64').toString('utf8');
                                // if (text2.indexOf('пн,') !== -1) {
                                //     text2 = text2.substring(0, text2.indexOf(`пн,`))
                                // } else if (text2.indexOf('вт,') !== -1) {
                                //     text2 = text2.substring(0, text2.indexOf(`вт,`))
                                // } else if (text2.indexOf('ср,') !== -1) {
                                //     text2 = text2.substring(0, text2.indexOf(`ср,`))
                                // } else if (text2.indexOf('чт,') !== -1) {
                                //     text2 = text2.substring(0, text2.indexOf(`чт,`))
                                // } else if (text2.indexOf('пт,') !== -1) {
                                //     text2 = text2.substring(0, text2.indexOf(`пт,`))
                                // } else if (text2.indexOf('сб,') !== -1) {
                                //     text2 = text2.substring(0, text2.indexOf(`сб,`))
                                // } else if (text2.indexOf('вс,') !== -1) {
                                //     text2 = text2.substring(0, text2.indexOf(`вс,`))
                                // }
                                // text2 = text2.substring(0, text2.lastIndexOf(`\r`))
                                // text2 = convert(text2, { wordwrap: false })
                            } else {
                                const data = result.data.payload.parts ? result.data.payload.parts[0].body.data : result.data.payload.body.data;
                                const text = Buffer.from(data, 'base64').toString('utf8');
                                text2 = convert(text, { wordwrap: false })
                            }
                            recepient = 'me'
                        } else {
                            const data = result.data.payload.parts ? result.data.payload.parts[0].body.data : result.data.payload.body.data;
                            const text = Buffer.from(data, 'base64').toString('utf8');
                            text2 = convert(text, { wordwrap: false })
                            recepient = 'notMe'
                        }
                    } else if (el.name === 'Subject') {
                        if (id === first) {
                            subjectFirst = el.value.substring(0, el.value.indexOf(userEmail) - 1)
                        };
                        if (el.value.indexOf(userEmail) !== -1) {
                            myMessageBool = true;
                        }
                    }
                })
                result.data.labelIds.forEach(el => {
                    if (el !== 'UNREAD') {
                        readBool = true
                    }
                })
                const dateMessage = { id, message: text2, date: dateOutMes, recepient, read: readBool, subjectFirst: subjectFirst };
                if (myMessageBool) {
                    dataForOutput.push(dateMessage);
                }
            }

        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: 'What\'s wrong' })
        }
    }

    async sendMessage(req, res) {
        try {

            const textMessage = req.body.textMessage;
            if (!textMessage) return res.status(500).json({ message: 'Message is empty' });

            const email = req.body.email;
            if (!textMessage) return res.status(500).json({ message: 'Email is empty' });

            const { interior_user_id } = req;

            const user = await User.findOne({ _id: interior_user_id });

            const userEmail = user.email;

            const themeMessage = req.body.themeMessage ? ` ${req.body.themeMessage} ,${userEmail}` : `irm@dkv.global ,${userEmail}`;

            const msg = createMimeMessage();
            msg.setSender({ addr: 'irm@dkv.global' });
            msg.setRecipient(email);
            msg.setSubject(themeMessage);
            msg.setMessage('text/plain', textMessage);

            const raw = msg.asRaw();
            const textRaw = raw;
            const textRawCoded = Buffer.from(textRaw).toString('base64url');

            const auth = authorizeToken();

            const gmail = google.gmail({ version: 'v1', auth });
            gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: textRawCoded
                }
            }, async (err, result) => {
                if (err) return console.log('The API returned an error: ' + err);
                const lead = await Lead.findOne({ email: email })
                let leadStatuses = lead.leadStatusForUser;
                if (!leadStatuses) {
                    leadStatuses = {}
                }
                leadStatuses[userEmail] = 'Message sent';
                const message = result;
                Lead.findOneAndUpdate({ email: email }, { leadStatusForUser: leadStatuses, leadStatus: 'Message sent' }, { new: true }, (err, doc) => {

                    return res.status(message.status).json({ message: message.statusText, lead: doc })
                })
            })
        } catch (e) {
            console.log(e)
        }
    }

    async getChosenSampleMessage(req, res) {
        try {
            const sampleMessage = await SampleMessage.findOne({ chosenMessage: true });
            return res.status(200).json(sampleMessage);
        } catch (e) {
            console.log('error = ', e);
        }
    }

    async setChosenSampleMessage(req, res) {
        try {
            const { _id } = req.query;
            await SampleMessage.findOneAndUpdate({ chosenMessage: true }, { chosenMessage: false });
            SampleMessage.findByIdAndUpdate(_id, { chosenMessage: true }, { new: true }, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!", err);
                    res.status(500).json({
                        message: "Something wrong when updating data!"
                    });
                } else {
                    return res.status(200).json({ message: 'Update successfully' })
                }
            });
        } catch (e) {
            console.log('error = ', e);
        }
    }

    async getSampleMessages(req, res) {
        try {
            const sampleMessage = await SampleMessage.find();
            return res.status(200).json(sampleMessage);
        } catch (e) {
            console.log('error = ', e);
        }
    }

    async createSampleMessage(req, res) {
        try {
            const { themeMessage, textMessage, templateName } = req.body

            const sampleMessage = new SampleMessage({ themeMessage, textMessage, templateName })

            await sampleMessage.save();
            return res.status(200).json({ message: "Sample message added successfully" });


        } catch (e) {
            console.log('error = ', e);
            return res.status(400).json({ message: 'What\'s wrong' })
        }
    }

    async updateSampleMessage(req, res) {
        try {
            const { _id } = req.body;
            const data = req.body;
            delete data._id;


            if (!_id || _id === '') {
                return res.status(404).json({
                    message: "id not valid"
                });
            }

            SampleMessage.findByIdAndUpdate({ _id }, data, { new: true }, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!", err);
                    res.status(500).json({
                        message: "Something wrong when updating data!"
                    });
                }
            });

            res.status(200).json({ message: "Sample message update successfully!" })

        } catch (e) {
            console.log(e)
        }
    }

    async deleteSampleMessage(req, res) {
        try {
            const { _id, chosen } = req.query;

            if (!_id || _id === '') {
                return res.status(404).json({
                    message: "id not valid"
                });
            }

            if (chosen) {
                await SampleMessage.findOneAndUpdate({ chosenMessage: false }, { chosenMessage: true });
            }

            await SampleMessage.findOneAndRemove({ _id }, (Error) => {
                if (Error) {
                    return res.status(500).json({
                        error: "There was a Server Error!"
                    });
                } else {
                    return res.status(200).json({
                        message: "Sample message delete successfully!"
                    });
                }
            }).clone();
        } catch (e) {
            console.log('error = ', e);
        }
    }


    async getNotification(req, res) {
        try {
            const auth = authorizeToken();
            const gmail = google.gmail({ version: 'v1', auth });
            gmail.users.messages.list({
                userId: 'me',
                maxResults: 1,
            }, (err, resp) => {
                if (err) return console.log('The API returned an error: ' + err);
                const message = resp.data.messages[0];
                gmail.users.messages.get({
                    userId: 'me',
                    id: message.id
                })
                    .then(async result => {
                        let email, emailFor
                        result.data.payload.headers.forEach(el => {
                            if (el.name === 'From') {
                                email = el.value.substring(el.value.indexOf('<') + 1, el.value.indexOf('>'))
                            } else if (el.name === 'Subject') {
                                emailFor = el.value.substring(el.value.indexOf(',') + 1, el.value.length)
                            }
                        })
                        const user = await User.findOne({ email: emailFor });
                        const lead = await Lead.findOne({ email: email });
                        if (!lead) return res.status(200).json({ error: 'lead not found' });

                        let leadStatuses = lead.leadStatusForUser;

                        if (!leadStatuses) {
                            leadStatuses = {};
                        }

                        leadStatuses[emailFor] = 'Message Received';
                        let leadUnreadWhere = lead.unreadId;
                        if (!leadUnreadWhere) {
                            leadUnreadWhere = [];
                        }
                        let checkNotification = false;
                        leadUnreadWhere.forEach(el => {
                            if (el === user._id.toString()) {
                                checkNotification = true
                            }
                        })
                        if (!checkNotification) {
                            leadUnreadWhere.push(user._id.toString())
                        }
                        Lead.findOneAndUpdate({ email: email }, { unreadId: leadUnreadWhere, leadStatusForUser: leadStatuses, leadStatus: 'Message Received' }, { new: true }, (err, doc) => {
                            if (err) {
                                console.log("Something wrong when updating data!", err);
                                return res.status(500).json({
                                    message: "Something wrong when updating data!"
                                });
                            }
                            return res.status(200).json(doc)
                        });
                    })
                    .catch(err => { console.log(err) })
            })
        } catch (e) {
            console.log(e)
        }

    }

    async getUnreadLead(req, res) {
        try {
            const { interior_user_id } = req;

            const leadUnread = await Lead.findOne({ owners: interior_user_id, unreadId: interior_user_id.toString() });

            if (leadUnread) {
                return res.status(200).json({ unread: true })
            } else {
                return res.status(200).json({ unread: false })
            }
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: `What's wrong` })
        }
    }

    async getMessageCounts(req, res) {
        try {
            const { interior_user_id } = req;

            const leads = await Lead.find({ owners: interior_user_id });
            const user = await User.findOne({ _id: interior_user_id })
            const auth = authorizeToken();

            const gmail = google.gmail({ version: 'v1', auth });
            let seachQuery = '';

            leads.forEach((el, index) => {
                seachQuery += `{to:${el.email} from:${el.email}}${index + 1 === leads.length ? '' : ' OR '}`
            })

            seachQuery += ` ${user.email}`

            const dataFull = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 10000,
                q: seachQuery
            })

            let date = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
            date = date.substring(0, date.indexOf('T'))
            const seachQueryLast = `${seachQuery} after:${date}`

            const dataLast = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 10000,
                q: seachQueryLast
            })
            let counts = 0, countsLast = 0;
            if (dataFull.data.messages) {
                counts = dataFull.data.messages.length;
            }
            if (dataLast.data.messages) {
                countsLast = dataFull.data.messages.length;
            }
            return res.status(200).json({
                counts: counts,
                last: countsLast
            })

        } catch (e) {
            console.log(e)
        }
    }

    async getMessageData(req, res) {
        try {
            const { interior_user_id } = req;

            const leads = await Lead.find({ owners: interior_user_id });
            const user = await User.findOne({ _id: interior_user_id })
            const auth = authorizeToken();

            const gmail = google.gmail({ version: 'v1', auth });
            let sentBool = '';
            let countAnswer = 0, countsUnanswer = 0, countsOverdue = 0, countsActiveMessage = 0, noOneMess = 0;

            for (let i = 0; i < leads.length; i++) {
                const seachQuery = `{to:${leads[i].email} from:${leads[i].email}} ${user.email}`;
                const dataFull = await gmail.users.messages.list({
                    userId: 'me',
                    maxResults: 10000,
                    q: seachQuery
                })

                let date = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
                date = date.substring(0, date.indexOf('T'))
                let dataLast;
                if (dataFull.data.messages) {
                    if (leads[i].leadStatusForUser[user.email] === 'Message Received') {
                        if (dataFull.data.messages.length > 1) {
                            let countMessageRecieved = 0;
                            const k = dataFull.data.messages.length > 3 ? 3 : dataFull.data.messages.length - 1
                            for (let j = 0; j < k; j++) {
                                dataLast = await gmail.users.messages.get({
                                    userId: 'me',
                                    id: dataFull.data.messages[j].id
                                })
                                dataLast.data.payload.headers.forEach(elem => {
                                    if (elem.name === 'To') {
                                        if (elem.value.indexOf('irm@dkv.global') !== -1) {
                                            sentBool = 'NotMe'
                                        } else {
                                            sentBool = 'Me'
                                        }
                                    } else if (elem.name === 'Date') {
                                        if (sentBool === 'NotMe') {
                                            if (new Date(date).valueOf() < new Date(elem.value).valueOf()) {
                                                countMessageRecieved++;
                                            }
                                        }
                                    }
                                })
                                if (countMessageRecieved >= 2) {
                                    countsActiveMessage++
                                } else {
                                    countAnswer++
                                }
                            }
                        } else {
                            countAnswer++
                        }

                    } else if (leads[i].leadStatusForUser[user.email] === 'Message sent') {
                        dataLast = await gmail.users.messages.get({
                            userId: 'me',
                            id: dataFull.data.messages[0].id//'180d88131b9aae3c'//dataFull.data.messages[0].id
                        })
                        dataLast.data.payload.headers.forEach(elem => {
                            if (elem.name === 'Date') {
                                if (new Date(date).valueOf() > new Date(elem.value).valueOf()) {
                                    countsOverdue++;
                                } else {
                                    countsUnanswer++;
                                }
                            }
                        })
                    }
                } else {
                    noOneMess++;
                }
            }
            const all = countAnswer + countsUnanswer + countsOverdue + countsActiveMessage;


            return res.status(200).json([{
                title: 'Answered',
                value: all === 0 ? 0 : Math.round(countAnswer / all * 100)
            },
            {
                title: 'In active communicaiton',
                value: all === 0 ? 0 : Math.round(countsActiveMessage / all * 100)
            },
            {
                title: 'Unanswered',
                value: all === 0 ? 0 : Math.round(countsUnanswer / all * 100)
            },
            {
                title: 'Overdue',
                value: all === 0 ? 0 : Math.round(countsOverdue / all * 100)
            },])
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new messageController();