const People = require('../models/People');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');

class peopleController {

    async addPeople(req, res) {
        try {
            let err = {};
            const errors = validationResult(req);
            const errorResult = errors.array();

            errorResult.forEach(elem => {
                err = elem;
            });

            if (!errors.isEmpty()) {
                return res.status(400).json({ message: err, err: true });
            }
            const { companyName, slug, linkedin, name, surname, industry, subIndustry, email, leadStatus, notes } = req.body;

            const candidate = await People.findOne({ email: email });
            if (candidate) return res.status(200).json({ message: 'People is already exist', err: true });

            // const candidateLead = await Lead.findOne({ email: email });
            // if (candidateLead) return res.status(200).json({ message: 'People is already exist in leads for another user', err: true })

            const people = new People({ companyName, slug, linkedin, name, surname, industry, subIndustry, email, leadStatus, notes });

            await people.save();
            return res.status(200).json({ message: "People added successfully" });

        } catch (error) {
            console.log('error = ', error);
        }
    }

    async getAllPeople(req, res) {
        try {
            const { interior_user_id } = req;

            const { page, seachQuery, relevantCompany } = req.query;


            let industry, subIndustry
            if (relevantCompany === 'true') {
                const user = await User.findOne({ _id: interior_user_id })
                industry = user.industry;
                subIndustry = user.subIndustry;
            }
            if (page) {
                if (industry || subIndustry) {
                    await People.paginate({
                        $or: [
                            { companyName: { $regex: new RegExp(seachQuery, "i") } },
                            { name: { $regex: new RegExp(seachQuery, "i") } },
                            { surname: { $regex: new RegExp(seachQuery, "i") } }
                        ],
                        $or: [{ industry: industry }, { subIndustry: subIndustry }]
                    },
                        { page: page, limit: 10 },
                        function (err, result) {
                            if (result.docs.length > 0) {
                                return res.status(200).json(result);
                            } else {
                                const response = {
                                    err: true,
                                    message: `No one relevant companies`,
                                    docs: [],
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
                                return res.status(200).json(response);
                            }
                        });
                } else {
                    await People.paginate(
                        {
                            $or: [
                                { companyName: { $regex: new RegExp(seachQuery, "i") } },
                                { name: { $regex: new RegExp(seachQuery, "i") } },
                                { surname: { $regex: new RegExp(seachQuery, "i") } }
                            ]
                        },
                        { page: page, limit: 10 },
                        (err, result) => {
                            return res.status(200).json(result);
                        })
                }
            } else {
                let allPeople;
                if (industry || subIndustry) {
                    allPeople = await People.find(
                        {
                            $or: [
                                { companyName: { $regex: new RegExp(seachQuery, "i") } },
                                { name: { $regex: new RegExp(seachQuery, "i") } },
                                { surname: { $regex: new RegExp(seachQuery, "i") } }
                            ],
                            industry: industry,
                            subIndustry: subIndustry
                        });
                } else {
                    allPeople = await People.find(
                        {
                            $or: [
                                { companyName: { $regex: new RegExp(seachQuery, "i") } },
                                { name: { $regex: new RegExp(seachQuery, "i") } },
                                { surname: { $regex: new RegExp(seachQuery, "i") } }
                            ],
                        });
                }
                return res.status(200).json(allPeople);
            }

        } catch (error) {
            console.log('error = ', error);
        }
    }

    async countAllPeople(req, res) {
        try {
            const allPeople = await People.find().count();

            var date = new Date();
            date.setMonth(date.getMonth() - 1);
            const lastPeople = await People.find({ createdAt: { $gte: date } }).count();

            return res.status(200).json({ allPeople, lastPeople });
        } catch (error) {
            console.log('error = ', error);
        }
    }

    async getPeople(req, res) {
        try {
            const { _id } = req.query;
            const people = await People.findById(_id);
            return res.json(people);

        } catch (error) {
            console.log('error = ', error);
        }
    }

    async getPeopleFromSlug(req, res) {
        try {
            const { slug } = req.query;
            const people = await People.findOne({ slug: slug });
            return res.json(people);

        } catch (error) {
            console.log('error = ', error);
        }
    }

    async deletePeople(req, res) {
        try {
            const { _id } = req.query;

            if (!_id || _id === '') {
                return res.status(404).json({
                    message: "id not valid"
                });
            }

            await People.findOneAndRemove({ _id }, (Error) => {
                if (Error) {
                    return res.status(400).json({
                        error: "There was a Server Error!"
                    });
                } else {
                    return res.status(200).json({
                        message: "People delete successfully!"
                    });
                }
            }).clone();
        } catch (error) {
            console.log('error = ', error);
        }
    }

    async updatePeople(req, res) {

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

            const { _id } = req.body;
            const data = req.body;
            delete data._id;

            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return res.status(404).json({ message: "unknown id" });
            }

            People.findByIdAndUpdate({ _id: _id }, data, { new: true }, (err, doc) => {
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

    async peopleInLead(req, res) {
        try {
            const { interior_user_id } = req;

            const data = req.body;

            const person = await Lead.findOne({ email: data.email });
            const user = await User.findOne({ _id: interior_user_id })
            if (person) {
                const leadsYou = await Lead.findOne({ email: data.email, owners: interior_user_id });

                if (leadsYou) return res.status(200).json({ message: 'Already exist in your leads', err: true })
                let status = person.leadStatusForUser;
                if (status) {
                    status = {};
                }
                status[user.email] = 'No action'
                const leadOwners = person.owners;
                let leadsStatuses
                if (person.leadStatusForUser) {
                    leadsStatuses = person.leadStatusForUser;
                } else {
                    leadsStatuses = {};
                }
                leadsStatuses[user.email] = 'No action'
                leadOwners.push(interior_user_id)
                Lead.findOneAndUpdate(
                    { email: data.email, slug: data.slug },
                    { owners: leadOwners, leadStatusForUser: status },
                    { new: true },
                    (err, doc) => {
                        return res.status(200).json({ message: `Lead is added` })
                    })
            } else {
                let status = {};
                status[user.email] = 'No action'
                const lead = new Lead({
                    companyName: data.companyName,
                    linkedin: data.linkedin,
                    name: data.name,
                    surname: data.surname,
                    email: data.email,
                    leadStatusForUser: status,
                    leadStatus: data.leadStatus,
                    industry: data.industry,
                    slug: data.slug,
                    subIndustry: data.subIndustry,
                    notes: data.notes,
                    owners: [interior_user_id]
                });
                await lead.save();
                return res.status(200).json({ message: `Lead is saved` })
            }
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: `What's wrong` })
        }
    }
}

module.exports = new peopleController();