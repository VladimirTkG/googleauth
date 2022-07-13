const Lead = require('../models/Lead');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');
const Json2csvParser = require("json2csv").Parser;
const Json2xlsxParser = require("json2xlsx");
const User = require('../models/User');
const { findOne } = require('../models/Lead');

class leadController {

    async addLead(req, res) {
        try {
            let err = {};
            const errors = validationResult(req);
            const errorResult = errors.array();

            errorResult.forEach(elem => {
                err = elem;
            });

            if (!errors.isEmpty()) {
                return res.status(400).json({ message: err });
            }
            const { interior_user_id } = req;

            const { companyName, slug, linkedin, name, surname, industry, subIndustry, email, leadStatus, notes } = req.body;

            const person = await Lead.findOne({ email: email });
            const user = await User.findOne({ _id: interior_user_id })

            //return res.status(200).json({ message: 'Lead already exists for another user', err: true })
            if (person) {
                let owners = person.owners;
                let status = person.leadStatusForUser;
                if (status) {
                    status = {};
                }
                status[user.email] = 'No action'
                const index = person.owners.findIndex(i => i == interior_user_id.toString())
                if (index !== -1) return res.status(200).json({ message: 'Lead already exists', err: true })
                owners.push(interior_user_id)
                await Lead.findOneAndUpdate({ email: email }, { owners: owners, leadStatusForUser: status })
            } else {
                let status = {};
                status[user.email] = 'No action'
                const lead = new Lead({ companyName, leadStatusForUser: status, slug, linkedin, name, surname, industry, subIndustry, email, leadStatus, notes, owners: [interior_user_id] });
                await lead.save();
            }

            return res.status(200).json({ message: "lead added successfully" });

        } catch (error) {
            console.log('error = ', error);
        }
    }

    async getAllLeads(req, res) {
        try {

            const { page } = req.query;

            if (page) {
                await Lead.paginate({}, { page: page, limit: 10 }, function (err, result) {
                    return res.status(200).json(result);
                });
            } else {
                // const allLeads = await Lead.find();
                const user = await Lead.find({});
                return res.status(200).json(user);
            }
        } catch (error) {
            console.log('error = ', error);
        }
    }

    async getLeadsUser(req, res) {
        try {
            const { page } = req.query;
            const { interior_user_id } = req;
            const user = await User.findOne({ _id: interior_user_id })
            if (page) {
                await Lead.paginate({ owners: interior_user_id }, { page: page, limit: 10 }, function (err, result) {
                    let data = [];
                    for (let i = 0; i < result.docs.length; i++) {
                        let bool = false;
                        if (result.docs[i].unreadId?.length >= 1) {
                            result.docs[i].unreadId.forEach(element => {
                                if (element === interior_user_id.toString()) {
                                    bool = true;
                                }
                            })
                        }
                        let status = 'No action', industry = '', subIndustry = ''
                        if (result.docs[i].leadStatusForUser) {
                            status = result.docs[i].leadStatusForUser[user.email]
                        }
                        if (result.docs[i].industry) industry = result.docs[i].industry
                        if (result.docs[i].subIndustry) subIndustry = result.docs[i].subIndustry

                        data.push({
                            "_id": result.docs[i]._id,
                            "companyName": result.docs[i].companyName,
                            "linkedin": result.docs[i].linkedin,
                            "name": result.docs[i].name,
                            "surname": result.docs[i].surname,
                            "email": result.docs[i].email,
                            "leadStatus": status,
                            "notes": result.docs[i].notes,
                            "unreadId": result.docs[i].unreadId,
                            "slug": result.docs[i].slug,
                            "industry": industry,
                            "subIndustry": subIndustry,
                            "unreadBool": bool
                        })
                    }
                    const resData = {
                        docs: data,
                        totalDocs: result.totalDocs,
                        limit: result.limit,
                        totalPages: result.totalPages,
                        page: result.page,
                        pagingCounter: result.pagingCounter,
                        hasPrevPage: result.hasPrevPage,
                        hasNextPage: result.hasNextPage,
                        prevPage: result.prevPage,
                        nextPage: result.nextPage
                    }
                    return res.status(200).json(resData);
                });
            } else {
                const allLeads = await Lead.find({ owners: interior_user_id });

                return res.status(200).json(allLeads);
            }
        } catch (error) {
            console.log('error = ', error);
        }
    }

    async getLeadsStatuses(req, res) {
        try {
            const { interior_user_id } = req;

            const allLeads = await Lead.find({ owners: interior_user_id });
            const allLeadsCount = allLeads.length;

            let statuses = [
                { title: 'Message Received', value: 0 },
                { title: 'Message sent', value: 0 },
                { title: 'No action', value: 0 }];

            await Promise.all(
                statuses.map(async (status) => {
                    const user = await User.findOne({ _id: interior_user_id })
                    const leads = await Lead.find({ owners: interior_user_id });
                    let count = 0;
                    leads.forEach(el => {
                        if (el.leadStatusForUser) {
                            if (el.leadStatusForUser[user.email] === status.title) {
                                count++
                            }
                        } else {
                            if (el.leadStatus === status.title) {
                                count++
                            }
                        }
                    })
                    console.log(Math.round(100 / allLeadsCount * count))
                    status.value = Math.round(100 / allLeadsCount * count);
                })
            )
            return res.status(200).json(statuses);
        } catch (error) {
            console.log('error = ', error);
        }
    }

    async countAllLeads(req, res) {
        try {
            const { interior_user_id } = req;

            const allLeads = await Lead.find({ owners: interior_user_id }).count();

            var date = new Date();
            date.setMonth(date.getMonth() - 1);
            const lastLeads = await Lead.find({ owners: interior_user_id, createdAt: { $gte: date } }).count();

            return res.status(200).json({ allLeads, lastLeads });
        } catch (error) {
            console.log('error = ', error);
        }
    }

    async getLead(req, res) {
        try {
            const { _id } = req.query;
            const lead = await Lead.findById(_id);
            res.json(lead);

        } catch (error) {
            console.log('error = ', error);
        }
    }

    async deleteLead(req, res) {
        try {
            const { _id } = req.query;
            const { interior_user_id } = req;

            if (!_id || _id === '') {
                return res.status(404).json({
                    message: "id not valid"
                });
            }
            const lead = await Lead.findById(_id);

            const index = lead.owners.findIndex(i => i == interior_user_id.toString())
            if (lead.owners.length > 1) {
                let owners = lead.owners;
                owners.splice(index, 1)
                Lead.findOneAndUpdate({ _id }, { owners: owners }, { new: true }, (err, doc) => {
                    return res.status(200).json({ message: "Lead delete successfully!" })
                })
            } else {
                await Lead.findOneAndRemove({ _id }, (Error) => {
                    if (Error) {
                        return res.status(500).json({
                            error: "There was a Server Error!"
                        });
                    } else {
                        return res.status(200).json({
                            message: "Lead delete successfully!"
                        });
                    }
                }).clone();
            }
        } catch (error) {
            console.log('error = ', error);
        }
    }

    async updateLead(req, res) {

        try {
            let err = {};
            const errors = validationResult(req);
            const errorResult = errors.array();

            errorResult.forEach(elem => {
                err = elem;
            });

            if (!errors.isEmpty()) {
                return res.status(200).json({ message: err });
            }

            const { _id } = req.body;
            const data = req.body;
            delete data._id;

            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(404).json({ message: "unknown id" });
            }

            Lead.findByIdAndUpdate({ _id: _id }, data, { new: true }, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!", err);
                    res.status(500).json({
                        message: "Something wrong when updating data!"
                    });
                }
            });

            return res.status(200).json({ message: "update successfully" });

        } catch (error) {
            console.log('error = ', error);
        }
    }

    async exportToCsv(req, res) {
        try {
            const { interior_user_id } = req;

            const lead = await Lead.find({ owners: interior_user_id });
            const leadJson = JSON.stringify(lead)
            const leadJsones = JSON.parse(leadJson)
            const json2csvParser = new Json2csvParser({ header: true });
            const csvData = json2csvParser.parse(leadJsones);
            fs.writeFile("files/LeadCSV.csv", csvData, function (error) {
                if (error) throw error;
                console.log("Write to LeadCSV.csv successfully!");

                const file = `./files/LeadCSV.csv`;
                res.download(file);
            });

        } catch (e) {
            console.log(e)
            res.status(400).json({ message: 'Error export!' })
        }
    }


    async exportToXlsx(req, res) {
        try {
            fs.unlink("./files/LeadXLSX.xlsx", function (err) {
                if (err) {
                    console.log(err);
                }
            });
            const { interior_user_id } = req;

            const lead = await Lead.find({ owners: interior_user_id });
            const leadJson = JSON.stringify(lead)
            const leadJsones = JSON.parse(leadJson)
            Json2xlsxParser.write('./files/LeadXLSX.xlsx', 'Leads', leadJsones)

            const file = `./files/LeadXLSX.xlsx`;
            res.download(file);
        } catch (e) {
            res.status(400).json({ message: 'Error export!' })
        }
    }

    async importFromCSV(req, res) {
        try {
            const { data } = req.body;
            const { interior_user_id } = req;

            let boolAccept = false;
            let count = 0;

            if (!data) {
                return res.status(404).json({ message: 'Import data not found!' });
            }
            const dataNormalize = data.replace(/"/g, '');

            const csvHeader = dataNormalize.slice(0, dataNormalize.indexOf("\n")).split(",");
            const csvRows = dataNormalize.slice(dataNormalize.indexOf("\n") + 1).split("\n");

            const array = csvRows.map(i => {
                const values = i.split(",");
                const obj = csvHeader.reduce((object, header, index) => {
                    object[header] = values[index];
                    return object;
                }, {});
                return obj;
            });

            for (let i = 0; i < array.length; i++) {
                const { companyName, linkedin, slug, name, surname, email, leadStatus, notes } = array[i];
                if (email) {
                    const leadEmail = await Lead.find({ email });
                    if (leadEmail.length === 0) {
                        const lead = new Lead({ companyName, linkedin, slug, name, surname, email, leadStatus, notes, owners: interior_user_id });
                        await lead.save();
                        boolAccept = true;
                        count++;
                    }
                } else {
                    const lead = new Lead({ companyName, linkedin, name, surname, slug, email, leadStatus, notes, owners: interior_user_id });
                    await lead.save();
                    boolAccept = true;
                }
            }
            if (!boolAccept) return res.status(200).json({ message: 'No one new Leads!', err: true });
            res.status(200).json({ message: `Import successfully! Imported ${count} of ${array.length}` });

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: 'Import error!!' })
        }
    }

    async importFromXlsx(req, res) {
        try {
            let boolAccept = false;
            const { arrayXl } = req.body;

            if (!arrayXl) {
                res.status(404).json({ message: 'Import error!' });
            }

            const { interior_user_id } = req;

            for (let i = 0; i < arrayXl.length; i++) {
                const { companyName, linkedin, slug, name, surname, email, leadStatus, notes } = arrayXl[i];
                if (email) {
                    const leadEmail = await Lead.find({ email });
                    if (leadEmail.length === 0) {
                        const lead = new Lead({ companyName, linkedin, slug, name, surname, email, leadStatus, notes, owners: interior_user_id });
                        await lead.save();
                        boolAccept = true;
                    } else {
                        const person = await Lead.findOne({ email });
                        const owners = person.owners;
                        owners.push(interior_user_id)
                        await Lead.findOneAndUpdate({ email }, { owners: owners })
                    }
                } else {
                    const lead = new Lead({ companyName, linkedin, slug, name, surname, email, leadStatus, notes, owners: interior_user_id });
                    await lead.save();
                    boolAccept = true;
                }
            }
            if (!boolAccept) return res.status(200).json({ message: 'No one new Leads!', err: true });
            res.status(200).json({ message: 'Import successfully!' });

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: 'Import error!!' })
        }
    }

    async getNotification(req, res) {
        try {
            const { interior_user_id } = req;

            const leadUnread = await Lead.findOne({ owners: interior_user_id, unread: interior_user_id })
            if (leadUnread) {
                return res.status(200).json(true)
            } else {
                return res.status(200).json(false)
            }
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: e })
        }
    }

}

module.exports = new leadController();