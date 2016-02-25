#!/usr/bin/env /usr/local/bin/node

'use strict';

const fetch = require('node-fetch');
const Q = require('q');

function getResultSymbol(result) {
    if (result == null) return '🌀';
    if (result === 'SUCCESS') return '✅';
    if (result === 'FAILURE') return '❌';

    return '❓';
}

function getJobUrl(jobName) {
    return baseUrl.concat('/job/', jobName);
}

function getJobApiUrl(jobName) {
    return getJobUrl(jobName).concat('/lastBuild/api/json');
}

const baseUrl = "http://your.jenkins.server";

fetch(baseUrl + '/api/json')
    .then(res => res.json())
    .then(data => data.jobs)
    .then(jobs => {
        Q.all(
            jobs
                .map(job => job.name)
                .map(jobName => {
                    return fetch(getJobApiUrl(jobName))
                        .then(res => res.json())
                        .then(jobData => {
                            return {name: jobName, result: jobData.result};
                        })
                })
        ).then(results => {
            var name = 'CI';
            if (results.filter(resultData => resultData.result === 'FAILURE').length > 0) {
                name = name.concat(' ', getResultSymbol('FAILURE'));
            } else {
                name = name.concat(' ', getResultSymbol('SUCCESS'));
            }
            console.log(name);
            console.log('---');
            results.forEach(resultData => {
                console.log(''
                    .concat(getResultSymbol(resultData.result), ' ', resultData.name)
                    .concat(' |')
                    .concat(' href="', getJobUrl(resultData.name),'"')
                    .concat(' size=14')
                );
            })
        })
        .catch(error => {
            console.log(error);
        });
    })
;
