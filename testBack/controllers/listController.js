const List = require("../models/List");
const User = require('../models/User');
const Lead = require('../models/Lead');
const fs = require('fs');
const Json2csvParser = require("json2csv").Parser;
const Json2xlsxParser = require("json2xlsx")


class listController {

    async getLists(req, res) {
        try {
            const { page } = req.query;
            const { interior_user_id } = req

            if (page) {
                await List.paginate({ owner: interior_user_id }, { page: page, limit: 10, populate: ['owner', 'leadsList'] }, function (err, result) {
                    return res.status(200).json(result);
                });
            } else {
                const lists = await List.find({ owner: interior_user_id }).populate('owner').populate('leadsList');
                return res.status(200).json(lists);
            }
        } catch (e) {
            console.log(e)
        }
    }

    async deleteList(req, res) {
        try {
            const { id } = req.query
            List.findOneAndDelete({ _id: id }, (Error) => {
                if (Error) {
                    return res.status(500).json({
                        error: "There was a Server Error!"
                    });
                } else {
                    return res.status(200).json({
                        message: "list delete successfully!"
                    });
                }
            });

        } catch (e) {
            console.log(e)
        }
    }

    async createList(req, res) {
        try {
            const { listName, leadsList } = req.body;
            const { interior_user_id } = req;
            let idLeads = [];
            for (let i = 0; i < leadsList.length; i++) {
                const leadId = await Lead.findOne({ _id: leadsList[i] })
                idLeads.push(leadId._id);
            }
            const list = new List({ listName: listName, owner: interior_user_id, leadsList: idLeads });
            await list.save();
            return res.status(200).json({ message: 'List created!' });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: e });
        }
    }

    async updateList(req, res) {
        try {
            const { _id } = req.body;
            const data = req.body;
            delete data._id;

            if (!_id || _id === '') {
                return res.status(404).json({
                    message: "id not valid"
                });
            }

            List.findByIdAndUpdate({ _id }, data, { new: true }, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!", err);
                    res.status(500).json({
                        message: "Something wrong when updating data!"
                    });
                }
            });

            res.status(200).json({ message: "list update successfully!" })
        } catch (e) {
            console.log(e)
        }
    }


    async exportListToCsv(req, res) {
        try {

            const list = await List.find({});
            const listJson = JSON.stringify(list);
            const listJsones = JSON.parse(listJson);
            const json2csvParser = new Json2csvParser({ header: true });
            const csvData = json2csvParser.parse(listJsones);
            fs.writeFile("files/listCSV.csv", csvData, function (error) {
                if (error) throw error;

                const file = `./files/listCSV.csv`;
                res.download(file);
            });
        } catch (e) {
            console.log(e)
        }
    }

    async exportListToXlsx(req, res) {
        try {
            fs.unlink("./files/listXLSX.xlsx", function (err) {
                if (err) {
                    console.log(err);
                }
            });
            const list = await List.find({});
            const listJson = JSON.stringify(list);
            const listJsones = JSON.parse(listJson);
            Json2xlsxParser.write('./files/listXLSX.xlsx', 'Lists', listJsones)

            const file = `./files/listXLSX.xlsx`;
            return res.download(file);
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: 'Error export!' })
        }
    }

    async exportListLeadsToCsv(req, res) {
        try {
            const { _id } = req.query;

            if (!_id || _id === '') {
                return res.status(404).json({
                    message: "id not valid"
                });
            }

            const list = await List.findOne({ _id: _id }).populate('leadsList');
            const listJson = JSON.stringify(list.leadsList);
            const listJsones = JSON.parse(listJson);
            const json2csvParser = new Json2csvParser({ header: true });
            const csvData = json2csvParser.parse(listJsones);
            fs.writeFile("files/listLeadsCSV.csv", csvData, function (error) {
                if (error) throw error;

                const file = `./files/listLeadsCSV.csv`;
                return res.download(file);
            });
        } catch (e) {
            console.log(e)
        }
    }


    async exportListLeadsToXlsx(req, res) {
        try {
            const { _id } = req.query;

            if (!_id || _id === '') {
                return res.status(404).json({
                    message: "id not valid"
                });
            }

            fs.unlink("./files/listLeadsXLSX.xlsx", function (err) {
                if (err) {
                    console.log(err);
                }
            });
            const list = await List.findOne({ _id: _id }).populate('leadsList');
            const listJson = JSON.stringify(list.leadsList);
            const listJsones = JSON.parse(listJson);
            Json2xlsxParser.write('./files/listLeadsXLSX.xlsx', 'Leads', listJsones)

            const file = `./files/listLeadsXLSX.xlsx`;
            return res.download(file);
        } catch (e) {
            return res.status(400).json({ message: 'Error export!' })
        }
    }

    async importListLeadsFromCSV(req, res) {
        try {
            const { data, id } = req.body;
            const { interior_user_id } = req;

            let boolAccept = false;

            const dataNormalize = data.replace(/"/g, '');
            if (!dataNormalize) {
                return res.status(404).json({ message: 'Import data not found!' });
            }
            const list = await List.findOne({ _id: id }).populate('leadsList');
            const leadsList = list.leadsList;

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
                let bool = false;
                const lead = await Lead.findOne({ email: array[i].email, owners: interior_user_id });
                if (lead) {
                    leadsList?.forEach(element => {
                        if (element.email === array[i].email) {
                            bool = true;
                        }
                    });
                    if (!bool) {
                        leadsList.push(lead._id);
                        boolAccept = true
                    }
                }
            }
            if (!boolAccept) return res.status(200).json({ message: 'No one new Leads!', err: true });
            List.findOneAndUpdate({ _id: id }, { leadsList: leadsList }, { new: true }, (err, doc) => {
                if (err) return res.status(400).json({ message: 'Import is lost' })
                return res.status(200).json({ message: 'Import successfully!', doc });
            });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: 'Import error!!' })
        }
    }

    async importListLeadsFromXlsx(req, res) {
        try {
            let boolAccept = false;
            const { arrayXl, id } = req.body;
            const { interior_user_id } = req

            if (!arrayXl) {
                return res.status(404).json({ message: 'Import data not found!' });
            }
            const list = await List.findOne({ _id: id }).populate('leadsList');
            let leadsList = list.leadsList;

            for (let i = 0; i < arrayXl.length; i++) {
                let bool = false;
                const lead = await Lead.findOne({ _id: arrayXl[i]._id, owner: interior_user_id })
                if (lead) {
                    leadsList?.forEach(element => {
                        if (element.email === arrayXl[i].email) {
                            bool = true;
                        }
                    });
                    if (!bool) {
                        leadsList.push(lead._id);
                        boolAccept = true
                    }
                }
            }

            if (!boolAccept) return res.status(200).json({ message: 'No one new Leads!', err: true });
            List.findOneAndUpdate({ _id: id }, { leadsList: leadsList }, { new: true }, (err, doc) => {
                if (err) return res.status(400).json({ message: 'Import is lost' })
                return res.status(200).json({ message: 'Import successfully!', doc });
            });

        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: 'Import error!!' })
        }
    }
}

module.exports = new listController();