import Koa from 'koa';
import Router from 'koa-router';
import Axios from "axios";
import {faker} from "@faker-js/faker";

const router = new Router();

const PORT = 5000;
let backKey = '';

let department_id = 10000;
let location_id = 1000000;

let n1 = 100000;
let n2 = 300000;

let n3 = 600000;
let n4 = 700000;
let n5 = 800000;


let per_page = 1000;


let attachmentArray = [
    {
        "url": "https://lever-ats-imports-beta.s3.us-west-1.amazonaws.com//auto-dm/gh/3/Untitled+document.pdf",
        "type": "cover_letter",
        "filename": "cover_letter.txt",
        "created_at": "2021-06-11T22:02:00.868Z"
    },
    {
        "url": "https://lever-ats-imports-beta.s3.us-west-1.amazonaws.com/auto-dm/gh/test-file/Fake+Resume.pdf",
        "type": "resume",
        "filename": "Resume_Deboprosad Mondal.docx",
        "created_at": "2021-06-11T22:02:00.802Z"
    },
    {
        "url": "https://lever-ats-imports-beta.s3.us-west-1.amazonaws.com//auto-dm/gh/3/Untitled+document.pdf",
        "type": "resume",
        "filename": "Pogodaev_CV.pdf",
        "created_at": "2021-06-16T19:00:02.740Z"
    },
    {
        "url": "https://lever-ats-imports-beta.s3.us-west-1.amazonaws.com/auto-dm/gh/test-file/Fake+Resume.pdf",
        "type": "resume",
        "filename": "CV-Alireza Minagar-June   2021.docx",
        "created_at": "2021-06-12T00:01:01.692Z"
    },
    {
        "url": "https://lever-ats-imports-beta.s3.us-west-1.amazonaws.com//auto-dm/gh/3/Untitled+document.pdf",
        "type": "resume",
        "filename": "Buchman_Resume.pdf",
        "created_at": "2021-06-12T23:48:01.006Z"
    }
];

export class Server {
    axios = Axios.create({
        baseURL: "https://harvest.greenhouse.io/v1/",
        auth: {
            username: "e3feea97c70be2444602f137f2894455-4",
            password: ""
        }
    });

    recordsToBeFetched = 1000;
    async init() {
        const app = new Koa();
        app.proxy = true;

        app.on("error", (err, ctx) => {
            let errMessage = `error at request ${ctx.request.method} ${ctx.request.href}. Message:${err ? err.message : ""}`;
        });

        router.get("/", async (ctx) => {
            ctx.body = "Hello, Mystic!";
        })

        router.get('/allData', async (ctx) => {
            const {page} = ctx.query;
            const appArr = await this.processApplications(page, per_page)
            const canArr = await this.processCandidates(page, per_page);

            ctx.body = appArr.concat(canArr);
            ctx.status = 200;
        })

        router.get('/applications', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processApplications(page, per_page)
            ctx.status = 200;
        });

        router.get('/candidates', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processCandidates(page, per_page);
            ctx.status = 200;
        });

        router.get('/departments', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processDepartments(page, per_page);
            ctx.status = 200;
        });

        router.get('/users', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processUsers(page, per_page);
            ctx.status = 200;
        });

        router.get('/tags/candidate', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processTags(page, per_page);
            ctx.status = 200;
        });

        router.get('/jobs', async (ctx) => {

            const {page} = ctx.query;

            ctx.body = await this.processJobs(page, per_page);
            ctx.status = 200;
        });

        router.get('/job_posts', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processJobPosts(page, per_page);
            ctx.status = 200;
        });

        router.get('/rejection_reasons', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processArchiveReasons(page, per_page);
            ctx.status = 200;
        });

        router.get('/sources', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processSources(page, per_page);
            ctx.status = 200;
        });

        router.get('/scorecards', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processScorecards(page, per_page);
            ctx.status = 200;
        });

        router.get('/email_templates', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processEmailTemplates(page, per_page);
            ctx.status = 200;
        });

        router.get('/offers', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processOffers(page, per_page);
            ctx.status = 200;
        });

        router.get('/offices', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processOffices(page, per_page);
            ctx.status = 200;
        });

        router.get('/activity_feed', async (ctx) => {
            const {page} = ctx.query;
            ctx.body = await this.processActivityFeeds(page, per_page);
            ctx.status = 200;
        });

        app.use(router.routes()).use(router.allowedMethods());

        app.listen(5000, () => {
            console.log(`Server started at http://localhost:${PORT}`)
        });
    }

    // Function to fetch the structure from the Greenhouse API
    async fetchApplicationStructure() {
        const response = await this.axios.get('/applications').then(response => response);
        return await this.extractStructure(response.data);
        // await this.axios.get('/applications').then(async response => {
        //     console.log(response.data);
        //     return await this.extractStructure(response.data)
        // })
    }

    async fetchCandidateStructure() {
        const response = await this.axios.get('/candidates');
        return this.extractStructure(response.data);
    }

    async fetchDeptStructure() {
        const response = await this.axios.get('/departments');
        return this.extractStructure(response.data);
    }

    async fetchSourceStructure() {
        const response = await this.axios.get('/sources');
        return this.extractStructure(response.data);
    }

    async fetchArStructure() {
        const response = await this.axios.get('/rejection_reasons');
        return this.extractStructure(response.data);
    }

    async fetchTagStructure() {
        const response = await this.axios.get('/tags/candidate');
        return this.extractStructure(response.data);
    }

    async fetchJobStructure() {
        const response = await this.axios.get('/jobs');
        return this.extractStructure(response.data);
    }

    async fetchFeedStructure() {
        const response = await this.axios.get('/candidates/5596220004/activity_feeds');
        return this.extractStructure(response.data);
    }

    async fetchUserStructure() {
        const response = await this.axios.get('/users');
        return this.extractStructure(response.data);
    }

    // email templates
    async fetchTemplateStructure() {
        const response = await this.axios.get('/email_templates');
        return this.extractStructure(response.data);
    }

    // offers
    async fetchOfferStructure() {
        const response = await this.axios.get('/offers');
        return this.extractStructure(response.data);
    }

    //scorecards
    async fetchScorecardStructure() {
        const response = await this.axios.get('/scorecards');
        return this.extractStructure(response.data);
    }

    // job post
    async fetchJobPostStructure() {
        const response = await this.axios.get('/job_posts');
        return this.extractStructure(response.data);
    }

    //offices
    async fetchOfficeStructure() {
        const response = await this.axios.get('/offices');
        return this.extractStructure(response.data);
    }

    async processScorecards(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Scorecards';
                let globalScorecardData = [];
                let scorecardGenData: any;
                const structure = await this.fetchScorecardStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;

                scorecardGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalScorecardData.push(...scorecardGenData);
                resolve(globalScorecardData);
            } catch (error) {
                console.error('Error retrieving email-template:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processJobPosts(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'JobPosts';
                let globalPostData = [];
                let postGenData: any;
                const structure = await this.fetchJobPostStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;

                postGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalPostData.push(...postGenData);
                resolve(globalPostData);
            } catch (error) {
                console.error('Error retrieving email-template:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processOffices(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Offices';
                let globalOfficeData = [];
                let officeGenData: any;
                const structure = await this.fetchOfficeStructure();

                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                officeGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalOfficeData.push(...officeGenData);

                resolve(globalOfficeData);
            } catch (error) {
                console.error('Error retrieving email-template:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processOffers(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Offers';
                let globalOfferData = [];
                let offerGenData: any;
                const structure = await this.fetchOfferStructure();

                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                offerGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalOfferData.push(...offerGenData);
                resolve(globalOfferData);

            } catch (error) {
                console.error('Error retrieving email-template:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processEmailTemplates(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'EmailTemplates';
                let globalTemplateData = [];
                let templateGenData: any;

                const structure = await this.fetchTemplateStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                templateGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalTemplateData.push(...templateGenData);

                resolve(globalTemplateData);
            } catch (error) {
                console.error('Error retrieving email-template:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processArchiveReasons(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'ArchiveReasons';
                let globalReasonData = [];
                let reasonGenData: any;
                const structure = await this.fetchArStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                reasonGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalReasonData.push(...reasonGenData);
                resolve(globalReasonData);
            } catch (error) {
                console.error('Error retrieving arhchive reason:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processSources(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Sources';
                let globalSrcData = [];
                let srcGenData: any;
                const structure = await this.fetchSourceStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                srcGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalSrcData.push(...srcGenData);

                resolve(globalSrcData);
            } catch (error) {
                console.error('Error retrieving sources:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processUsers(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Users';
                let globalUserData = [];
                let userGenData: any;
                const structure = await this.fetchUserStructure();

                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                userGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalUserData.push(...userGenData);

                resolve(globalUserData);

            } catch (error) {
                console.error('Error retrieving users:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processTags(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Tags';
                let globalTagData = [];
                let tagGenData: any;
                const structure = await this.fetchTagStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                tagGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalTagData.push(...tagGenData);
                resolve(globalTagData);

            } catch (error) {
                console.error('Error retrieving tags:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processJobs(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Jobs';
                let globalJobData = [];
                let jobGenData: any;
                const structure = await this.fetchJobStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;

                jobGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalJobData.push(...jobGenData);
                resolve(globalJobData);
            } catch (error) {
                console.error('Error retrieving jobs:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processApplications(unique_id: any, per_page: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Applications';
                let globalAppData = [];
                let appGenData: any;

                const structure = await this.fetchApplicationStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                appGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalAppData.push(...appGenData);
                resolve(globalAppData);

            } catch (error) {
                console.error('Error retrieving applications:', error);
                reject(error); // Reject the promise with the error
            }
        });
    }

    async processCandidates(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Candidates';
                let canGenData: any;
                let globalCanData = [];

                const structure = await this.fetchCandidateStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                canGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalCanData.push(...canGenData);
                resolve(globalCanData)

            } catch (error) {
                console.error('Error retrieving candidates:', error);
                reject(error);
            }
        })
    }

    async processActivityFeeds(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'ActivityFeeds';
                let feedGenData: any;
                let globalFeedData = [];
                const structure = await this.fetchFeedStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                feedGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalFeedData.push(...feedGenData);
                resolve(globalFeedData)

            } catch (error) {
                console.error('Error retrieving candidates:', error);
                reject(error);
            }
        })
    }

    async processDepartments(unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let process = 'Departments';
                let depGenData: any;
                let globalDeptData = [];

                const structure = await this.fetchDeptStructure();
                const startIndex = 1;
                const endIndex = this.recordsToBeFetched;
                depGenData = await this.generateBatchedData(structure, startIndex, endIndex, process, unique_id, per_page);
                globalDeptData.push(...depGenData);
                resolve(globalDeptData)

            } catch (error) {
                console.error('Error retrieving candidates:', error);
                reject(error);
            }
        })
    }

    async extractStructure(ghData: any) {
        const sampleGhData = ghData[0];
        return await this.traverseObject(sampleGhData);
    }

// Function to recursively traverse an object and extract its structure

    async traverseObject(obj: any) {
        const structure: any = {};
        const datePattern1 = /^\d{4}-\d{2}-\d{2}$/;
        const datePattern2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;// Matches "YYYY-MM-DD" format


        for (const key in obj) {

            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (Array.isArray(value)) {
                    backKey = key;
                    structure[key] = await Promise.all(
                        value.map(async (item) => {
                            if (typeof item === 'object' && item !== null) {
                                return backKey == 'attachments' ? 'attachmentObj' : await this.traverseObject(item);
                            } else {
                                if (datePattern1.test(item) || datePattern2.test(item)) {
                                    return 'date';
                                } else {
                                    if (backKey == 'location') {
                                        return 'string';
                                    }
                                    if (backKey == 'email_addresses' && key == 'value') {
                                        return 'email';
                                    }
                                    return typeof item;
                                }
                            }
                        })
                    );
                    backKey = '';
                } else if (typeof value === 'object' && value !== null) {
                    backKey = key;
                    backKey == 'attachments' ? structure[key] = 'attachmentObj' : structure[key] = await this.traverseObject(value)
                    backKey = '';
                } else {
                    if (datePattern1.test(value) || datePattern2.test(value)) {
                        structure[key] = 'date';
                    } else {
                        if (backKey == 'location') {
                            structure[key] = 'string'
                        } else if (backKey == 'email_addresses' && key == 'value') {
                            structure[key] = 'email';
                        } else {
                            structure[key] = typeof value;
                        }
                    }

                }
            }
        }

        return structure;
    }


// Function to generate batched random data based on the extracted structure
    async generateBatchedData(structure: any, startIndex: any, endIndex: any, process: any, unique_id: any, per_page: any) {
        return new Promise(async (resolve, reject) => {
            try {
                const batchedData = [];
                for (let i = startIndex; i <= endIndex; i++) {
                    const randomData = await this.generateRandomData(structure, process, unique_id, per_page, i);
                    batchedData.push(randomData);
                }
                resolve(batchedData);
            } catch (e) {
                reject(e);
            }

        })
    }

// Function to generate random data based on the extracted structure

    async generateRandomData(structure: any, process: any, unique_id: any, per_page: any, i: any, data: any = {}) {
        for (const key in structure) {

            if (structure.hasOwnProperty(key)) {
                const valueType = structure[key];

                data[key] = Array.isArray(valueType) ?
                    await Promise.all(
                        valueType.map(async (item) => {
                            return (typeof item === 'object') ?
                                await this.generateRandomData(item, process, unique_id, per_page, i) :
                                await this.generateRandomValue(item, process, key, unique_id, per_page, i);
                        })
                    ) :
                    typeof valueType === 'object' ?
                        await this.generateRandomData(valueType, process, unique_id, per_page, i) :
                        await this.generateRandomValue(valueType, process, key, unique_id, per_page, i);
            }
            if (key == 'attachments') {
                data[key].push(await this.generateRandomValue('attachmentObj', process, key, unique_id, per_page, i));
            }
        }
        return data;
    };

    // async deepCopy(obj) {
    //     if (typeof obj !== 'object' || obj === null) {
    //         return obj;
    //     }
    //
    //     let newObj = {};
    //
    //     for (const key in obj) {
    //         if (typeof obj[key] === 'object' && obj[key] !== null) {
    //             newObj[key] = await this.deepCopy(obj[key]);
    //         } else {
    //             newObj[key] = await this.generateRandomValue(obj[key]);
    //         }
    //     }
    //
    //     return newObj;
    // };

// Function to generate random values based on the data type


    async generateRandomValue(type: any, process: any, key: any, unique_id: any, per_page: any, i: any) {

        switch (type) {
            case 'email':
                return faker.internet.email();

            case 'string':
                if (key === 'first_name') {
                    return faker.name.firstName();
                } else if (key === 'last_name') {
                    return faker.name.lastName();
                } else if (key === 'company') {
                    return faker.company.name();
                }
                return faker.name.firstName();

            case 'number':

                if (process == 'Department' && key == 'id') {
                    return (department_id + (unique_id * per_page)) + i;
                }

                if (process == 'Jobs') {
                    return (n1 + (unique_id * per_page)) + i;
                }
                if (process == 'JobPosts' && key == 'job_id') {
                    return (n1 + (unique_id * per_page)) + i;
                }
                if (process == 'JobPosts' && key == 'id') {
                    return (n2 + (unique_id * per_page)) + i;
                }

                if (process == 'Candidates') {
                    return (n3 + (unique_id * per_page)) + i;
                }
                if (process == 'Applications' && key == 'id') {
                    return (n4 + (unique_id * per_page)) + i;
                }
                if (process == 'Applications' && key == 'candidate_id') {
                    return (n3 + (unique_id * per_page)) + i;
                }
                if (process == 'Scorecards' && key == 'id') {
                    return (n5 + (unique_id * per_page)) + i;
                }
                if (process == 'Scorecards' && key == 'candidate_id') {
                    return (n3 + (unique_id * per_page)) + i;
                }

                if (process == 'Offices' && key == 'id') {
                    return (location_id + (unique_id * per_page)) + i;
                }
                return faker.datatype.number();

            case 'boolean':
                return faker.datatype.boolean();

            case 'date':
                return faker.date.past();

            case 'attachmentObj':
                return attachmentArray[Math.floor(Math.random() * attachmentArray.length)];

            default:
                return null;
        }

    }
}